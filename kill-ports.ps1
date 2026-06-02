# Kill all development server ports
# This script kills processes running on common development ports

param(
    [int[]]$Ports = @(3000, 3001, 3002, 3003, 8080, 8000, 5000, 4200, 5173),
    [switch]$KillAllNode,
    [switch]$KillAllNext
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Blis Club - Port Cleanup           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$killedAny = $false

# Kill by specific ports
foreach ($port in $Ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Killing process '$($process.ProcessName)' (PID: $($process.Id)) on port $port" -ForegroundColor Yellow
                    Stop-Process -Id $process.Id -Force
                    $killedAny = $true
                }
            }
        } else {
            Write-Host "Port $port is free" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "Could not check port $port : $_" -ForegroundColor Red
    }
}

# Optionally kill all Node.js processes
if ($KillAllNode) {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        foreach ($proc in $nodeProcesses) {
            Write-Host "Killing Node process (PID: $($proc.Id))" -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
            $killedAny = $true
        }
    } else {
        Write-Host "No Node processes found" -ForegroundColor DarkGray
    }
}

# Optionally kill all Next.js processes (via node with next)
if ($KillAllNext) {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        try {
            $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine
            $cmdLine -match "next"
        } catch { $false }
    }
    if ($nodeProcesses) {
        foreach ($proc in $nodeProcesses) {
            Write-Host "Killing Next.js process (PID: $($proc.Id))" -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
            $killedAny = $true
        }
    } else {
        Write-Host "No Next.js processes found" -ForegroundColor DarkGray
    }
}

Write-Host ""
if ($killedAny) {
    Write-Host "Cleanup complete! Ports freed." -ForegroundColor Green
} else {
    Write-Host "No processes were running. Everything is clean!" -ForegroundColor Green
}

Write-Host ""
Write-Host "You can now run .\start-server.ps1 to start fresh" -ForegroundColor Cyan
