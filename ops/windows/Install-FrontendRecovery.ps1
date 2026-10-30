#Requires -RunAsAdministrator
[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$TaskName = 'ODC-TEST-PROD-FRONTEND',
    [string]$WebConfig = 'C:\inetpub\wwwroot\web.config',
    [string]$RuntimeDirectory = 'C:\Orange Digital Center\ops\frontend-recovery'
)

$ErrorActionPreference = 'Stop'
# The service deployment owns production once either fixed NSSM slot exists.
foreach ($serviceName in @('ODC-PROD-FRONTEND', 'ODC-PROD-FRONTEND-SECONDARY')) {
    if (Test-Path -LiteralPath ("HKLM:\SYSTEM\CurrentControlSet\Services\" + $serviceName)) {
        throw "Le frontend utilise les services Windows. Utiliser Install-FrontendServiceWatchdog.ps1; installation par tache refusee ($serviceName)."
    }
}
. (Join-Path $PSScriptRoot 'FrontendRecovery.Common.ps1')
$watchdogTask = 'ODC-TEST-PROD-FRONTEND-WATCHDOG'
$context = Get-FrontendTaskContext $TaskName
$port = Get-PublishedFrontendPort $WebConfig
if ($port -ne $context.Port) { throw 'IIS and frontend task ports differ. Installation refused.' }
if ($context.Task.Principal.UserId -notin @('SYSTEM', 'S-1-5-18', 'NT AUTHORITY\SYSTEM')) {
    throw 'Frontend task is not running as SYSTEM. Review its service account before installation.'
}
$node = 'C:\Program Files\nodejs\node.exe'
if (-not (Test-Path -LiteralPath $node -PathType Leaf)) { throw 'Node.js executable not found.' }
foreach ($name in @('FrontendRecovery.Common.ps1', 'Start-FrontendSupervisor.ps1', 'Test-FrontendRecovery.ps1')) {
    $path = Join-Path $PSScriptRoot $name
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Recovery source missing: $path" }
    $tokens = $null; $parseErrors = $null
    $null = [Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$parseErrors)
    if ($parseErrors.Count -gt 0) { throw "Recovery script has syntax errors: $path" }
}
$before = Test-FrontendResponse $port
Write-Output "Frontend before installation: $($before.Detail), port $port"
if (-not $PSCmdlet.ShouldProcess("$TaskName / port $port", 'Install supervisor and minute watchdog without stopping the healthy frontend')) { return }

$runtimePath = [IO.Path]::GetFullPath($RuntimeDirectory).TrimEnd('\')
if (-not $runtimePath.StartsWith('C:\Orange Digital Center\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Recovery runtime must be inside the ODC workspace.'
}
$null = New-Item -ItemType Directory -Path $RuntimeDirectory -Force
# The watchdog runs as SYSTEM: only SYSTEM and Administrators may change its code.
$acl = [Security.AccessControl.DirectorySecurity]::new()
$acl.SetAccessRuleProtection($true, $false)
foreach ($sid in @('S-1-5-18', 'S-1-5-32-544')) {
    $rule = [Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid), 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    $acl.AddAccessRule($rule)
}
$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new('S-1-5-32-545'), 'ReadAndExecute', 'ContainerInherit,ObjectInherit', 'None', 'Allow'))
Set-Acl -LiteralPath $RuntimeDirectory -AclObject $acl
$backup = Join-Path $RuntimeDirectory ('backups\' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfff'))
$null = New-Item -ItemType Directory -Path $backup -Force
Copy-Item -LiteralPath $context.Runner -Destination (Join-Path $backup 'start-frontend-production.ps1')
Export-ScheduledTask -TaskName $TaskName | Set-Content -LiteralPath (Join-Path $backup 'frontend-task.xml') -Encoding UTF8
if (Get-ScheduledTask -TaskName $watchdogTask -ErrorAction SilentlyContinue) {
    Export-ScheduledTask -TaskName $watchdogTask | Set-Content -LiteralPath (Join-Path $backup 'watchdog-task.xml') -Encoding UTF8
}
$manifest = @{ Runner = $context.Runner; TaskName = $TaskName; WatchdogTask = $watchdogTask; Port = $port; RuntimeDirectory = $RuntimeDirectory }
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backup 'installation.json') -Encoding UTF8
$runtimeNames = @('FrontendRecovery.Common.ps1', 'Start-FrontendSupervisor.ps1', 'Test-FrontendRecovery.ps1')
$previousRuntime = @{}
$runtimeBackup = Join-Path $backup 'runtime'
$null = New-Item -ItemType Directory -Path $runtimeBackup -Force
foreach ($name in $runtimeNames) {
    $previousRuntime[$name] = Test-Path -LiteralPath (Join-Path $RuntimeDirectory $name)
    if ($previousRuntime[$name]) { Copy-Item -LiteralPath (Join-Path $RuntimeDirectory $name) -Destination (Join-Path $runtimeBackup $name) }
}
$supervisor = Join-Path $RuntimeDirectory 'Start-FrontendSupervisor.ps1'
$runner = @'
$ErrorActionPreference = 'Stop'
$frontend = Join-Path $PSScriptRoot 'frontend'
& '__SUPERVISOR__' -FrontendPath $frontend -Port __PORT__
exit $LASTEXITCODE
'@.Replace('__SUPERVISOR__', $supervisor.Replace("'", "''")).Replace('__PORT__', [string]$port)
$runnerChanged = $false
$settingsChanged = $false
try {
    foreach ($name in $runtimeNames) {
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot $name) -Destination (Join-Path $RuntimeDirectory $name) -Force
    }
    [IO.File]::WriteAllText($context.Runner, $runner, [Text.UTF8Encoding]::new($false))
    $runnerChanged = $true
    $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 10 `
        -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable -MultipleInstances IgnoreNew `
        -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $triggers = @($context.Task.Triggers)
    if (-not ($triggers | Where-Object { $_.CimClass.CimClassName -eq 'MSFT_TaskBootTrigger' })) {
        $triggers += New-ScheduledTaskTrigger -AtStartup
    }
    Set-ScheduledTask -TaskName $TaskName -Settings $settings -Trigger $triggers | Out-Null
    $settingsChanged = $true
    $powershell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $watchdog = Join-Path $RuntimeDirectory 'Test-FrontendRecovery.ps1'
    $arguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + $watchdog + '" -TaskName "' + $TaskName + '" -WebConfig "' + $WebConfig + '"'
    $action = New-ScheduledTaskAction -Execute $powershell -Argument $arguments -WorkingDirectory $RuntimeDirectory
    $triggers = @((New-ScheduledTaskTrigger -AtStartup), (New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)))
    $watchSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 2) `
        -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
    $definition = New-ScheduledTask -Action $action -Trigger $triggers -Settings $watchSettings -Principal $principal
    Register-ScheduledTask -TaskName $watchdogTask -InputObject $definition -Force | Out-Null
    & wevtutil.exe sl Microsoft-Windows-TaskScheduler/Operational /e:true
    if ($LASTEXITCODE -ne 0) { throw 'Could not enable Task Scheduler operational history.' }
    Start-FrontendTaskSupervisor $TaskName $port
    Start-ScheduledTask -TaskName $watchdogTask
} catch {
    foreach ($name in $runtimeNames) {
        if ($previousRuntime[$name]) {
            Copy-Item -LiteralPath (Join-Path $runtimeBackup $name) -Destination (Join-Path $RuntimeDirectory $name) -Force
        }
    }
    if ($runnerChanged) { Copy-Item -LiteralPath (Join-Path $backup 'start-frontend-production.ps1') -Destination $context.Runner -Force }
    if ($settingsChanged) { Set-ScheduledTask -TaskName $TaskName -Settings $context.Task.Settings -Trigger $context.Task.Triggers | Out-Null }
    if (Test-Path -LiteralPath (Join-Path $backup 'watchdog-task.xml')) {
        Register-ScheduledTask -TaskName $watchdogTask -Xml (Get-Content -LiteralPath (Join-Path $backup 'watchdog-task.xml') -Raw) -Force | Out-Null
    } elseif (Get-ScheduledTask -TaskName $watchdogTask -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $watchdogTask -Confirm:$false
    }
    throw
}
$after = Test-FrontendResponse $port
Write-Output "Recovery installed. Frontend: $($after.Detail), port $port"
Write-Output "Watchdog task: $watchdogTask (every minute and at startup)"
Write-Output "Backup: $backup"
Write-Output 'Supervisor is active. The existing healthy Node process was not stopped.'
