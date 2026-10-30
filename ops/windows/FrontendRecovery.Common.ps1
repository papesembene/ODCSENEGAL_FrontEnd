Set-StrictMode -Version 2.0

function Write-RecoveryLog {
    param([string]$Directory, [string]$Name, [string]$Message)
    $null = New-Item -ItemType Directory -Path $Directory -Force
    $path = Join-Path $Directory $Name
    if ((Test-Path -LiteralPath $path) -and (Get-Item -LiteralPath $path).Length -gt 2MB) {
        Move-Item -LiteralPath $path -Destination ($path + '.1') -Force
    }
    Add-Content -LiteralPath $path -Encoding UTF8 -Value (([DateTime]::UtcNow.ToString('o')) + ' ' + $Message)
}

function Get-PublishedFrontendPort {
    param([string]$WebConfig)
    [xml]$xml = Get-Content -LiteralPath $WebConfig -Raw -ErrorAction Stop
    $action = $xml.SelectSingleNode("/configuration/system.webServer/rewrite/rules/rule[@name='ReverseProxyToNextJS']/action")
    if (-not $action -or $action.url -notmatch '^http://127\.0\.0\.1:(\d+)/\{R:0\}$') {
        throw 'Unexpected IIS frontend target; recovery refused.'
    }
    return [int]$Matches[1]
}

function Get-FrontendTaskContext {
    param([string]$TaskName)
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
    $actions = @($task.Actions)
    if ($actions.Count -ne 1 -or [IO.Path]::GetFileName($actions[0].Execute) -ine 'powershell.exe') {
        throw 'Unexpected frontend task action; recovery refused.'
    }
    $match = [regex]::Match($actions[0].Arguments, '(?i)-File\s+"([^"]+\.ps1)"')
    if (-not $match.Success) { throw 'Frontend runner path not found in task action.' }
    $runner = [IO.Path]::GetFullPath($match.Groups[1].Value)
    $workspace = [IO.Path]::GetFullPath('C:\Orange Digital Center\')
    if (-not $runner.StartsWith($workspace, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Frontend runner is outside the ODC workspace; recovery refused.'
    }
    $text = Get-Content -LiteralPath $runner -Raw -ErrorAction Stop
    $portMatch = [regex]::Match($text, '(?i)-Port\s+(\d+)\b')
    if (-not $portMatch.Success) {
        $portMatch = [regex]::Match($text, '(?i)["'']-p["'']\s+["''](\d+)["'']')
    }
    if (-not $portMatch.Success) { throw 'Frontend runner port not found; recovery refused.' }
    $frontend = Join-Path (Split-Path -Parent $runner) 'frontend'
    $cli = Join-Path $frontend 'node_modules\next\dist\bin\next'
    if (-not (Test-Path -LiteralPath $cli -PathType Leaf)) { throw 'Next.js CLI is missing.' }
    [pscustomobject]@{ Task = $task; Runner = $runner; Frontend = $frontend; Cli = $cli; Port = [int]$portMatch.Groups[1].Value }
}

function Test-FrontendResponse {
    param([int]$Port, [int]$TimeoutSeconds = 5)
    try {
        # Loopback only: an external DNS/TLS incident must not restart a healthy frontend.
        $request = [Net.HttpWebRequest]::Create("http://127.0.0.1:$Port/")
        $request.Proxy = $null
        $request.Timeout = $TimeoutSeconds * 1000
        $request.ReadWriteTimeout = $TimeoutSeconds * 1000
        $request.AllowAutoRedirect = $false
        $response = $request.GetResponse()
        try {
            $status = [int]$response.StatusCode
            return [pscustomobject]@{ Healthy = ($status -eq 200); Detail = "HTTP $status" }
        } finally { $response.Close() }
    } catch {
        return [pscustomobject]@{ Healthy = $false; Detail = $_.Exception.Message }
    }
}

function Get-FrontendListenerProcess {
    param([int]$Port)
    $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalAddress -in @('127.0.0.1', '0.0.0.0', '::', '::1') } |
        Select-Object -ExpandProperty OwningProcess -Unique)
    foreach ($processId in $listeners) {
        Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction Stop
    }
}

function Test-OwnedFrontendProcess {
    param($Process, [string]$Cli, [int]$Port)
    if ($Process.Name -ine 'node.exe' -or -not $Process.CommandLine) { return $false }
    $command = $Process.CommandLine.Replace('/', '\')
    $expected = [IO.Path]::GetFullPath($Cli).Replace('/', '\')
    return ($command.IndexOf($expected, [StringComparison]::OrdinalIgnoreCase) -ge 0 -and
        $command -match ('(?:^|\s)-p\s+"?' + $Port + '"?(?:\s|$)'))
}

function Test-FrontendSupervisorActive {
    param([int]$Port)
    $handle = $null
    $acquired = $false
    try {
        try { $handle = [Threading.Mutex]::OpenExisting("Global\ODC-Frontend-Supervisor-$Port") }
        catch [Threading.WaitHandleCannotBeOpenedException] { return $false }
        catch [UnauthorizedAccessException] {
            # A supervisor started as SYSTEM before this ACL fix has a private mutex.
            # Access denied still proves the named object exists; the SYSTEM watchdog
            # can inspect the lock itself, while the administrator installer preserves it.
            return $true
        }
        try { $acquired = $handle.WaitOne(0) }
        catch [Threading.AbandonedMutexException] { $acquired = $true }
        return (-not $acquired)
    } finally {
        if ($acquired) { $handle.ReleaseMutex() }
        if ($handle) { $handle.Dispose() }
    }
}

function Start-FrontendTaskSupervisor {
    param([string]$TaskName, [int]$Port)
    if (Test-FrontendSupervisorActive $Port) { return }
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
    $restoreSettings = $null
    try {
        if ($task.State -eq 'Running') {
            # A legacy wrapper may still own a healthy Node. Start the standby supervisor
            # beside that wrapper; the mutex and listener check prevent duplicate Nodes.
            $restoreSettings = $task.Settings
            $parallel = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 10 `
                -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable -MultipleInstances Parallel `
                -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
            Set-ScheduledTask -TaskName $TaskName -Settings $parallel | Out-Null
        }
        Start-ScheduledTask -TaskName $TaskName -ErrorAction Stop
        for ($attempt = 0; $attempt -lt 15; $attempt++) {
            if (Test-FrontendSupervisorActive $Port) { return }
            Start-Sleep -Seconds 1
        }
        throw 'Frontend supervisor did not start; current listener was not stopped.'
    } finally {
        if ($restoreSettings) { Set-ScheduledTask -TaskName $TaskName -Settings $restoreSettings | Out-Null }
    }
}
