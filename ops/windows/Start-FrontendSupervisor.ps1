[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$FrontendPath,
    [Parameter(Mandatory)][ValidateRange(1024, 65535)][int]$Port,
    [string]$NodePath = 'C:\Program Files\nodejs\node.exe'
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'FrontendRecovery.Common.ps1')
$frontend = (Resolve-Path -LiteralPath $FrontendPath).Path
$cli = Join-Path $frontend 'node_modules\next\dist\bin\next'
foreach ($required in @($NodePath, $cli, (Join-Path $frontend '.next\BUILD_ID'))) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw "Required frontend file missing: $required" }
}
$logs = Join-Path $frontend 'ops-logs'
$mutexSecurity = [Security.AccessControl.MutexSecurity]::new()
foreach ($sid in @('S-1-5-18', 'S-1-5-32-544', [Security.Principal.WindowsIdentity]::GetCurrent().User.Value) | Select-Object -Unique) {
    $mutexSecurity.AddAccessRule([Security.AccessControl.MutexAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid), 'FullControl', 'Allow'))
}
$created = $false
$mutex = [Threading.Mutex]::new($false, "Global\ODC-Frontend-Supervisor-$Port", [ref]$created, $mutexSecurity)
$locked = $false
$child = $null
try {
    try { $locked = $mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $locked = $true }
    if (-not $locked) { exit 0 }
    Write-RecoveryLog $logs 'supervisor.log' "supervisor_started port=$Port wrapper_pid=$PID frontend=$frontend"
    $delay = 2
    $waitingForListener = $false
    while ($true) {
        $occupied = @([Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() |
            Where-Object { $_.Port -eq $Port }).Count -gt 0
        if ($occupied) {
            if (-not $waitingForListener) {
                Write-RecoveryLog $logs 'supervisor.log' "existing_listener port=$Port; waiting without stopping the existing process"
                $waitingForListener = $true
            }
            Start-Sleep -Seconds 5
            continue
        }
        $waitingForListener = $false
        # Preserve recent failures before starting another child. File count and size are bounded.
        foreach ($stream in @('stdout', 'stderr')) {
            $current = Join-Path $logs "next.$stream.log"
            if (Test-Path -LiteralPath $current) {
                $archive = Join-Path $logs ("next.$stream." + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfff') + '.log')
                Move-Item -LiteralPath $current -Destination $archive
            }
            Get-ChildItem -LiteralPath $logs -Filter "next.$stream.*.log" |
                Sort-Object Name -Descending | Select-Object -Skip 4 |
                ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force }
        }
        $started = [DateTime]::UtcNow
        try {
            # Separate file redirection avoids Windows PowerShell treating native stderr as a terminating error.
            $child = Start-Process -FilePath $NodePath -ArgumentList ('"' + $cli + '" start -H 127.0.0.1 -p ' + $Port) `
                -WorkingDirectory $frontend -WindowStyle Hidden -PassThru `
                -RedirectStandardOutput (Join-Path $logs 'next.stdout.log') `
                -RedirectStandardError (Join-Path $logs 'next.stderr.log')
            $null = $child.Handle
            Write-RecoveryLog $logs 'supervisor.log' "child_started pid=$($child.Id) port=$Port"
            $child.WaitForExit()
            $child.Refresh()
            $seconds = [int]([DateTime]::UtcNow - $started).TotalSeconds
            Write-RecoveryLog $logs 'supervisor.log' "child_exited pid=$($child.Id) exit_code=$($child.ExitCode) runtime_seconds=$seconds"
            if ($seconds -ge 60) { $delay = 2 }
        } catch {
            Write-RecoveryLog $logs 'supervisor.log' ("child_start_failed " + $_.Exception.Message)
        } finally { if ($child) { $child.Dispose(); $child = $null } }
        Write-RecoveryLog $logs 'supervisor.log' "restart_in_seconds=$delay"
        Start-Sleep -Seconds $delay
        $delay = [Math]::Min($delay * 2, 60)
    }
} catch {
    Write-RecoveryLog $logs 'supervisor.log' ("supervisor_failed " + $_.Exception.Message)
    exit 1
} finally {
    if ($locked) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
