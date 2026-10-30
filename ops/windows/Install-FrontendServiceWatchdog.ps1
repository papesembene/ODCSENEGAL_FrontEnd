#Requires -RunAsAdministrator
[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$WebConfig = 'C:\inetpub\wwwroot\web.config',
    [string]$RuntimeDirectory = 'C:\Orange Digital Center\ops\frontend-recovery'
)

$ErrorActionPreference = 'Stop'
$taskName = 'ODC-TEST-PROD-FRONTEND-WATCHDOG'
$runtimeNames = @('FrontendRecovery.Common.ps1', 'FrontendService.Common.ps1', 'Test-FrontendService.ps1')
$runtime = [IO.Path]::GetFullPath($RuntimeDirectory).TrimEnd('\')
if (-not $runtime.StartsWith('C:\Orange Digital Center\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Le runtime doit rester dans C:\Orange Digital Center.'
}
foreach ($name in $runtimeNames) {
    $path = Join-Path $PSScriptRoot $name
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Script necessaire introuvable: $path" }
    $tokens = $null
    $parseErrors = $null
    $null = [Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$parseErrors)
    if ($parseErrors.Count -gt 0) { throw "Erreur de syntaxe dans $path" }
}
if (-not (Test-Path -LiteralPath $WebConfig -PathType Leaf)) { throw "Configuration IIS introuvable: $WebConfig" }
if (-not $PSCmdlet.ShouldProcess($taskName, 'Installer le controle HTTP des services NSSM, chaque minute et au demarrage')) { return }

$null = New-Item -ItemType Directory -Path $runtime -Force
# This scheduled check runs as SYSTEM, so only SYSTEM and administrators may edit it.
$acl = [Security.AccessControl.DirectorySecurity]::new()
$acl.SetAccessRuleProtection($true, $false)
foreach ($sid in @('S-1-5-18', 'S-1-5-32-544')) {
    $rule = [Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid), 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    $acl.AddAccessRule($rule)
}
$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new('S-1-5-32-545'), 'ReadAndExecute', 'ContainerInherit,ObjectInherit', 'None', 'Allow'))
Set-Acl -LiteralPath $runtime -AclObject $acl

$backup = Join-Path $runtime ('backups\service-watchdog-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfff'))
$null = New-Item -ItemType Directory -Path $backup -Force
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
$hadTask = ($null -ne $existingTask)
if ($hadTask) {
    Export-ScheduledTask -TaskName $taskName | Set-Content -LiteralPath (Join-Path $backup 'watchdog-task.xml') -Encoding UTF8
}
$previousRuntime = @{}
foreach ($name in $runtimeNames) {
    $target = Join-Path $runtime $name
    $previousRuntime[$name] = Test-Path -LiteralPath $target -PathType Leaf
    if ($previousRuntime[$name]) { Copy-Item -LiteralPath $target -Destination (Join-Path $backup $name) }
}
@{ TaskName = $taskName; RuntimeDirectory = $runtime; WebConfig = $WebConfig; HadTask = $hadTask } |
    ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backup 'installation.json') -Encoding UTF8

$taskChanged = $false
try {
    # Stop only the short check before changing its shared scripts and action.
    if ($hadTask) { Disable-ScheduledTask -TaskName $taskName -ErrorAction Stop | Out-Null }
    if ($hadTask -and $existingTask.State -eq 'Running') {
        Stop-ScheduledTask -TaskName $taskName -ErrorAction Stop
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            if ((Get-ScheduledTask -TaskName $taskName -ErrorAction Stop).State -ne 'Running') { break }
            Start-Sleep -Milliseconds 250
        }
        if ((Get-ScheduledTask -TaskName $taskName -ErrorAction Stop).State -eq 'Running') {
            throw 'Le precedent controle HTTP ne s arrete pas; installation annulee.'
        }
    }
    foreach ($name in $runtimeNames) {
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot $name) -Destination (Join-Path $runtime $name) -Force
    }
    $powershell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    $watchdog = Join-Path $runtime 'Test-FrontendService.ps1'
    $arguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "' + $watchdog + '" -WebConfig "' + $WebConfig + '"'
    $action = New-ScheduledTaskAction -Execute $powershell -Argument $arguments -WorkingDirectory $runtime
    $triggers = @(
        (New-ScheduledTaskTrigger -AtStartup),
        (New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1))
    )
    $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 2) `
        -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
    $definition = New-ScheduledTask -Action $action -Trigger $triggers -Settings $settings -Principal $principal
    Register-ScheduledTask -TaskName $taskName -InputObject $definition -Force | Out-Null
    $taskChanged = $true
    Start-ScheduledTask -TaskName $taskName -ErrorAction Stop
} catch {
    $installError = $_
    foreach ($name in $runtimeNames) {
        $target = Join-Path $runtime $name
        if ($previousRuntime[$name]) {
            Copy-Item -LiteralPath (Join-Path $backup $name) -Destination $target -Force
        } elseif (Test-Path -LiteralPath $target -PathType Leaf) {
            Remove-Item -LiteralPath $target -Force
        }
    }
    if ($hadTask) {
        Register-ScheduledTask -TaskName $taskName -Xml (Get-Content -LiteralPath (Join-Path $backup 'watchdog-task.xml') -Raw) -Force | Out-Null
    } elseif ($taskChanged) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }
    throw $installError
}
Write-Output "Controle des services installe: $taskName (chaque minute et au demarrage)."
Write-Output "Sauvegarde: $backup"
