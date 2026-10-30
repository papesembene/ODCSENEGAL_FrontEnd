[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$WebConfig = 'C:\inetpub\wwwroot\web.config',
    [string[]]$ServiceNames = @('ODC-PROD-FRONTEND', 'ODC-PROD-FRONTEND-SECONDARY'),
    [string]$StateDirectory = 'C:\Orange Digital Center\ops\frontend-recovery\state'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'FrontendService.Common.ps1')
$mutex = [Threading.Mutex]::new($false, 'Global\ODC-Frontend-Watchdog')
$locked = $false
$file = Join-Path $StateDirectory 'health.json'
$state = @{ Target = ''; Failures = 0; LastHealthy = $false; LastRecoveryUtc = '' }
function Save-ServiceHealth {
    if (-not $WhatIfPreference) {
        $null = New-Item -ItemType Directory -Path $StateDirectory -Force
        $state | ConvertTo-Json | Set-Content -LiteralPath ($file + '.tmp') -Encoding UTF8
        Move-Item -LiteralPath ($file + '.tmp') -Destination $file -Force
    }
}
try {
    try { $locked = $mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $locked = $true }
    if (-not $locked) { exit 0 }
    $context = Get-PublishedFrontendNssmContext -WebConfig $WebConfig -ServiceNames $ServiceNames
    if (Test-Path -LiteralPath $file) {
        try {
            $saved = Get-Content -LiteralPath $file -Raw | ConvertFrom-Json
            foreach ($key in @('Target','Failures','LastHealthy','LastRecoveryUtc')) { if ($saved.PSObject.Properties[$key]) { $state[$key] = $saved.$key } }
        } catch { Write-RecoveryLog $StateDirectory 'watchdog.log' 'service_state_unreadable; resetting counter' }
    }
    $target = "$($context.Name)|$($context.Port)|$($context.Frontend)"
    if ($state.Target -ne $target) { $state = @{ Target = $target; Failures = 0; LastHealthy = $false; LastRecoveryUtc = '' } }
    $health = Test-FrontendResponse $context.Port
    $listeners = @(Get-FrontendListenerProcess $context.Port)
    $unknown = @($listeners | Where-Object { -not (Test-OwnedNssmFrontendNode $_ $context) })
    if ($health.Healthy -and $unknown.Count -eq 0 -and $listeners.Count -eq 1 -and $context.Service.State -eq 'Running') {
        if (-not $state.LastHealthy) { Write-RecoveryLog $StateDirectory 'watchdog.log' "healthy service=$($context.Name) port=$($context.Port)" }
        $state.Failures = 0
        $state.LastHealthy = $true
        # Remove only closed rotations from this service, preserving current stdout/stderr.
        Get-ChildItem -LiteralPath $context.Logs -File -Filter 'nssm.*' |
            Where-Object { $_.Name -notin @('nssm.stdout.log','nssm.stderr.log') } |
            Sort-Object LastWriteTime -Descending | Select-Object -Skip 12 |
            ForEach-Object { if ($PSCmdlet.ShouldProcess($_.FullName,'Remove old NSSM log rotation')) { Remove-Item -LiteralPath $_.FullName -Force } }
    } else {
        $state.Failures = [int]$state.Failures + 1
        $state.LastHealthy = $false
        Write-RecoveryLog $StateDirectory 'watchdog.log' "unhealthy service=$($context.Name) port=$($context.Port) failures=$($state.Failures) service_state=$($context.Service.State) detail=$($health.Detail)"
        if ($unknown.Count -gt 0) {
            Write-RecoveryLog $StateDirectory 'watchdog.log' 'unrecognized_listener; service restart refused'
        } else {
            $wrapper = $null
            if ($context.Service.ProcessId -gt 0) { $wrapper = Get-CimInstance Win32_Process -Filter "ProcessId=$($context.Service.ProcessId)" -ErrorAction SilentlyContinue }
            $starting = ($wrapper -and ([DateTime]::UtcNow - $wrapper.CreationDate.ToUniversalTime()).TotalSeconds -lt 60)
            $cooldown = ($state.LastRecoveryUtc -and ([DateTime]::UtcNow - [DateTime]::Parse($state.LastRecoveryUtc).ToUniversalTime()).TotalSeconds -lt 120)
            $stopped = ($context.Service.State -eq 'Stopped' -and $listeners.Count -eq 0)
            if (-not $starting -and -not $cooldown -and ($stopped -or $state.Failures -ge 3)) {
                if ($PSCmdlet.ShouldProcess($context.Name,'Recover validated frontend NSSM service')) {
                    $state.LastRecoveryUtc = [DateTime]::UtcNow.ToString('o')
                    Save-ServiceHealth
                    if ($context.Service.State -eq 'Stopped') { Start-Service -Name $context.Name -ErrorAction Stop }
                    else { Restart-Service -Name $context.Name -Force -ErrorAction Stop }
                    Write-RecoveryLog $StateDirectory 'watchdog.log' "service_recovery_requested name=$($context.Name)"
                }
            }
        }
    }
    Save-ServiceHealth
} catch {
    Write-RecoveryLog $StateDirectory 'watchdog.log' ("service_watchdog_failed " + $_.Exception.Message)
    exit 1
} finally { if ($locked) { $mutex.ReleaseMutex() }; $mutex.Dispose() }
