[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$TaskName = 'ODC-TEST-PROD-FRONTEND',
    [string]$WebConfig = 'C:\inetpub\wwwroot\web.config',
    [string]$StateDirectory = 'C:\Orange Digital Center\ops\frontend-recovery\state',
    [ValidateRange(2, 10)][int]$FailureThreshold = 3
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'FrontendRecovery.Common.ps1')
$mutex = [Threading.Mutex]::new($false, 'Global\ODC-Frontend-Watchdog')
$locked = $false
$stateFile = Join-Path $StateDirectory 'health.json'
$state = @{ Target = ''; Failures = 0; LastRecoveryUtc = ''; LastHealthy = $false }
try {
    try { $locked = $mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $locked = $true }
    if (-not $locked) { exit 0 }
    $context = Get-FrontendTaskContext $TaskName
    $publishedPort = Get-PublishedFrontendPort $WebConfig
    # A deployment changing IIS and task action is allowed to finish before recovery acts.
    if ($publishedPort -ne $context.Port) {
        Write-RecoveryLog $StateDirectory 'watchdog.log' "target_mismatch iis=$publishedPort task=$($context.Port); no restart"
        exit 0
    }
    if (Test-Path -LiteralPath $stateFile) {
        try {
            $saved = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
            foreach ($key in @('Target', 'Failures', 'LastRecoveryUtc', 'LastHealthy')) {
                if ($saved.PSObject.Properties[$key]) { $state[$key] = $saved.$key }
            }
        } catch { Write-RecoveryLog $StateDirectory 'watchdog.log' 'state_unreadable; resetting failure counter' }
    }
    $target = "$publishedPort|$($context.Runner)"
    if ($state.Target -ne $target) {
        $state = @{ Target = $target; Failures = 0; LastRecoveryUtc = ''; LastHealthy = $false }
    }
    $health = Test-FrontendResponse $publishedPort
    if ($health.Healthy) {
        if (-not $state.LastHealthy) { Write-RecoveryLog $StateDirectory 'watchdog.log' "healthy port=$publishedPort" }
        $state.Failures = 0
        $state.LastHealthy = $true
        if (-not (Test-FrontendSupervisorActive $publishedPort)) {
            if ($PSCmdlet.ShouldProcess($TaskName, 'Start standby supervisor while keeping the healthy listener')) {
                Write-RecoveryLog $StateDirectory 'watchdog.log' "supervisor_missing port=$publishedPort; starting standby"
                Start-FrontendTaskSupervisor $TaskName $publishedPort
            }
        }
    } else {
        $state.Failures = [int]$state.Failures + 1
        $state.LastHealthy = $false
        Write-RecoveryLog $StateDirectory 'watchdog.log' "unhealthy port=$publishedPort failures=$($state.Failures) task_state=$($context.Task.State) detail=$($health.Detail)"
        $listeners = @(Get-FrontendListenerProcess $publishedPort)
        $unknown = @($listeners | Where-Object { -not (Test-OwnedFrontendProcess $_ $context.Cli $publishedPort) })
        if ($unknown.Count -gt 0) {
            Write-RecoveryLog $StateDirectory 'watchdog.log' 'unrecognized_listener; automatic restart refused'
        } else {
            $ownedNodes = $listeners
            if ($listeners.Count -eq 0) {
                # Also cover a known child stuck before it opens its listening socket.
                $ownedNodes = @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction Stop |
                    Where-Object { Test-OwnedFrontendProcess $_ $context.Cli $publishedPort })
            }
            $info = Get-ScheduledTaskInfo -TaskName $TaskName -ErrorAction Stop
            $starting = ($context.Task.State -eq 'Running' -and ([DateTime]::UtcNow - $info.LastRunTime.ToUniversalTime()).TotalSeconds -lt 60)
            if (@($ownedNodes | Where-Object { ([DateTime]::UtcNow - $_.CreationDate.ToUniversalTime()).TotalSeconds -lt 60 }).Count -gt 0) { $starting = $true }
            $cooldown = ($state.LastRecoveryUtc -and ([DateTime]::UtcNow - [DateTime]::Parse($state.LastRecoveryUtc).ToUniversalTime()).TotalSeconds -lt 120)
            $stopped = ($context.Task.State -ne 'Running' -and $ownedNodes.Count -eq 0)
            if (-not $starting -and -not $cooldown -and ($stopped -or $state.Failures -ge $FailureThreshold)) {
                if ($PSCmdlet.ShouldProcess("$TaskName on loopback port $publishedPort", 'Recover frontend')) {
                    $state.LastRecoveryUtc = [DateTime]::UtcNow.ToString('o')
                    $null = New-Item -ItemType Directory -Path $StateDirectory -Force
                    $state | ConvertTo-Json | Set-Content -LiteralPath ($stateFile + '.tmp') -Encoding UTF8
                    Move-Item -LiteralPath ($stateFile + '.tmp') -Destination $stateFile -Force
                    Write-RecoveryLog $StateDirectory 'watchdog.log' "recovery_started runner=$($context.Runner) task_result=$($info.LastTaskResult)"
                    if ($context.Task.State -eq 'Running') {
                        Stop-ScheduledTask -TaskName $TaskName -ErrorAction Stop
                        Start-Sleep -Seconds 2
                    }
                    # A candidate launched before deployment may be outside the scheduled task.
                    # Kill only the same verified Node process, with its creation date checked against PID reuse.
                    foreach ($listener in $ownedNodes) {
                        $current = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.ProcessId)" -ErrorAction SilentlyContinue
                        if ($current -and $current.CreationDate -eq $listener.CreationDate -and
                            (Test-OwnedFrontendProcess $current $context.Cli $publishedPort)) {
                            Write-RecoveryLog $StateDirectory 'watchdog.log' "stopping_unresponsive_owned_node pid=$($current.ProcessId)"
                            Stop-Process -Id $current.ProcessId -Force -ErrorAction Stop
                        }
                    }
                    Start-Sleep -Seconds 3
                    if (-not (Test-FrontendResponse $publishedPort).Healthy) {
                        Start-ScheduledTask -TaskName $TaskName -ErrorAction Stop
                    }
                    Write-RecoveryLog $StateDirectory 'watchdog.log' 'recovery_requested; next run will check the response'
                }
            }
        }
    }
    if (-not $WhatIfPreference) {
        $null = New-Item -ItemType Directory -Path $StateDirectory -Force
        $temporary = $stateFile + '.tmp'
        $state | ConvertTo-Json | Set-Content -LiteralPath $temporary -Encoding UTF8
        Move-Item -LiteralPath $temporary -Destination $stateFile -Force
    }
} catch {
    Write-RecoveryLog $StateDirectory 'watchdog.log' ("watchdog_failed " + $_.Exception.Message)
    exit 1
} finally {
    if ($locked) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
