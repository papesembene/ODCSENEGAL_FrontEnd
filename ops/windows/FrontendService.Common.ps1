Set-StrictMode -Version 2.0
. (Join-Path $PSScriptRoot 'FrontendRecovery.Common.ps1')

function Assert-FrontendServiceName([string]$ServiceName) {
    if ($ServiceName -notmatch '^ODC-(PROD-FRONTEND(-SECONDARY)?|VALIDATE-[a-zA-Z0-9-]+)$') {
        throw 'Service name is outside the ODC frontend allowlist.'
    }
}

function Invoke-FrontendSc([string]$Arguments) {
    $info = [Diagnostics.ProcessStartInfo]::new()
    $info.FileName = Join-Path $env:SystemRoot 'System32\sc.exe'
    $info.Arguments = $Arguments
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $info
    try {
        $null = $process.Start()
        $output = $process.StandardOutput.ReadToEnd()
        $errorText = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw "Service control failed: $output $errorText" }
    } finally { $process.Dispose() }
}

function Initialize-FrontendNssmBinary {
    $destination = 'C:\Orange Digital Center\ops\frontend-recovery\bin\nssm.exe'
    if (Test-Path -LiteralPath $destination -PathType Leaf) { return $destination }
    $old = Get-CimInstance Win32_Service -Filter "Name='MonSite'" -ErrorAction Stop
    if (-not $old) { throw 'NSSM source service MonSite is missing.' }
    $source = $old.PathName.Trim('"')
    if ([IO.Path]::GetFileName($source) -ine 'nssm.exe' -or -not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw 'NSSM executable used by MonSite could not be validated.'
    }
    $null = New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force
    Copy-Item -LiteralPath $source -Destination $destination
    if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash) {
        throw 'NSSM copy hash mismatch.'
    }
    return $destination
}

function Get-FrontendNssmContext {
    param([Parameter(Mandatory)][string]$ServiceName)
    Assert-FrontendServiceName $ServiceName
    $service = Get-CimInstance Win32_Service -Filter "Name='$ServiceName'" -ErrorAction Stop
    if (-not $service) { throw "Frontend service missing: $ServiceName" }
    $nssm = 'C:\Orange Digital Center\ops\frontend-recovery\bin\nssm.exe'
    if ($service.PathName.Trim('"') -ine $nssm) { throw 'Unexpected frontend service executable.' }
    $key = Get-Item -LiteralPath ("HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName\Parameters") -ErrorAction Stop
    $node = [string]$key.GetValue('Application', '')
    $frontend = [string]$key.GetValue('AppDirectory', '')
    $arguments = [string]$key.GetValue('AppParameters', '')
    $key.Dispose()
    if ($node -ine 'C:\Program Files\nodejs\node.exe') { throw 'Unexpected Node.js executable in service.' }
    $frontend = [IO.Path]::GetFullPath($frontend).TrimEnd('\')
    if (-not $frontend.StartsWith('C:\Orange Digital Center\', [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Frontend service directory is outside the ODC workspace.'
    }
    $cli = Join-Path $frontend 'node_modules\next\dist\bin\next'
    $match = [regex]::Match($arguments, '^"([^"]+)" start -H 127\.0\.0\.1 -p (\d+)$')
    if (-not $match.Success -or $match.Groups[1].Value -ine $cli) { throw 'Unexpected frontend service arguments.' }
    if (-not (Test-Path -LiteralPath $cli -PathType Leaf) -or -not (Test-Path -LiteralPath (Join-Path $frontend '.next\BUILD_ID') -PathType Leaf)) {
        throw 'Frontend service build or CLI is missing.'
    }
    [pscustomobject]@{ Name = $ServiceName; Service = $service; Frontend = $frontend; Cli = $cli; Port = [int]$match.Groups[2].Value; NodePath = $node; NssmPath = $nssm; Logs = (Join-Path $frontend 'ops-logs') }
}

function Get-PublishedFrontendNssmContext {
    param(
        [string]$WebConfig = 'C:\inetpub\wwwroot\web.config',
        [string[]]$ServiceNames = @('ODC-PROD-FRONTEND', 'ODC-PROD-FRONTEND-SECONDARY')
    )
    $port = Get-PublishedFrontendPort $WebConfig
    $matchingContexts = @()
    foreach ($name in $ServiceNames) {
        Assert-FrontendServiceName $name
        if (Get-Service -Name $name -ErrorAction SilentlyContinue) {
            $context = Get-FrontendNssmContext $name
            if ($context.Port -eq $port) { $matchingContexts += $context }
        }
    }
    if ($matchingContexts.Count -ne 1) { throw 'Exactly one validated NSSM service must match the IIS frontend port.' }
    return $matchingContexts[0]
}

function Set-FrontendNssmService {
    param([Parameter(Mandatory)][string]$ServiceName, [Parameter(Mandatory)][string]$FrontendPath, [Parameter(Mandatory)][ValidateRange(1024,65535)][int]$Port)
    Assert-FrontendServiceName $ServiceName
    $frontend = (Resolve-Path -LiteralPath $FrontendPath).Path.TrimEnd('\')
    if (-not $frontend.StartsWith('C:\Orange Digital Center\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid frontend workspace path.' }
    $node = 'C:\Program Files\nodejs\node.exe'
    $cli = Join-Path $frontend 'node_modules\next\dist\bin\next'
    foreach ($path in @($node, $cli, (Join-Path $frontend '.next\BUILD_ID'))) {
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Missing frontend file: $path" }
    }
    $nssm = Initialize-FrontendNssmBinary
    $service = Get-CimInstance Win32_Service -Filter "Name='$ServiceName'" -ErrorAction Stop
    if ($service) {
        if ($service.State -ne 'Stopped' -or $service.PathName.Trim('"') -ine $nssm) { throw 'Refusing to reconfigure a running or unrecognized frontend service.' }
        Set-Service -Name $ServiceName -StartupType Manual
    } else {
        New-Service -Name $ServiceName -DisplayName "$ServiceName (Next.js)" -BinaryPathName ('"' + $nssm + '"') `
            -StartupType Manual -Description 'ODC production frontend. NSSM directly supervises Node.js.' | Out-Null
    }
    $logs = Join-Path $frontend 'ops-logs'
    $null = New-Item -ItemType Directory -Path $logs -Force
    $parameters = "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName\Parameters"
    $null = New-Item -Path $parameters -Force
    $key = [Microsoft.Win32.Registry]::LocalMachine.OpenSubKey("SYSTEM\CurrentControlSet\Services\$ServiceName\Parameters", $true)
    $strings = @{ Application = $node; AppDirectory = $frontend; AppParameters = ('"' + $cli + '" start -H 127.0.0.1 -p ' + $Port); AppStdout = (Join-Path $logs 'nssm.stdout.log'); AppStderr = (Join-Path $logs 'nssm.stderr.log') }
    foreach ($entry in $strings.GetEnumerator()) { $key.SetValue($entry.Key, $entry.Value, [Microsoft.Win32.RegistryValueKind]::String) }
    $key.SetValue('AppEnvironmentExtra', [string[]]@('NODE_ENV=production'), [Microsoft.Win32.RegistryValueKind]::MultiString)
    $numbers = @{ AppRestartDelay = 2000; AppThrottle = 1500; AppKillProcessTree = 1; AppRotateFiles = 1; AppRotateOnline = 1; AppRotateSeconds = 86400; AppRotateBytes = 10485760 }
    foreach ($entry in $numbers.GetEnumerator()) { $key.SetValue($entry.Key, [int]$entry.Value, [Microsoft.Win32.RegistryValueKind]::DWord) }
    $key.Dispose()
    $exitPath = Join-Path $parameters 'AppExit'
    $null = New-Item -Path $exitPath -Force
    $exitKey = [Microsoft.Win32.Registry]::LocalMachine.OpenSubKey("SYSTEM\CurrentControlSet\Services\$ServiceName\Parameters\AppExit", $true)
    try { $exitKey.SetValue('', 'Restart', [Microsoft.Win32.RegistryValueKind]::String) } finally { $exitKey.Dispose() }
    Invoke-FrontendSc "failure $ServiceName reset= 86400 actions= restart/5000/restart/10000/restart/30000"
    Invoke-FrontendSc "failureflag $ServiceName 1"
}

function Test-OwnedNssmFrontendNode {
    param($Process, $Context)
    return ((Test-OwnedFrontendProcess $Process $Context.Cli $Context.Port) -and
        $Context.Service.ProcessId -gt 0 -and $Process.ParentProcessId -eq $Context.Service.ProcessId)
}

function Set-FrontendIisTextAtomic {
    param([string]$Path, [string]$Content)
    [xml]$configuration = $Content
    if (-not $configuration.DocumentElement -or $configuration.DocumentElement.Name -ne 'configuration') { throw 'Invalid IIS configuration XML.' }
    $target = [IO.Path]::GetFullPath($Path)
    $suffix = '.odc-' + [guid]::NewGuid().ToString('N')
    $staged = $target + $suffix + '.tmp'
    $backup = $target + $suffix + '.bak'
    try {
        [IO.File]::WriteAllText($staged, $Content, [Text.UTF8Encoding]::new($false))
        $null = [xml][IO.File]::ReadAllText($staged)
        [IO.File]::Replace($staged, $target, $backup)
    } finally { foreach ($temporary in @($staged, $backup)) { if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force } } }
}
