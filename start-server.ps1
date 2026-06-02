# Start Blis Club Development Server
# This script starts the Next.js dev server and optionally opens the browser

param(
    [switch]$NoBrowser,
    [int]$Port = 3000
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Blis Club - Starting Server        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path -LiteralPath "$PSScriptRoot\node_modules")) {
    Write-Host "node_modules not found. Running npm install first..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed. Please check the errors above." -ForegroundColor Red
        exit 1
    }
}

# Check if port is already in use
$portInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "Port $Port is already in use. Killing existing process..." -ForegroundColor Yellow
    $process = Get-Process -Id $portInUse.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.Id -Force
        Write-Host "Killed process on port $Port" -ForegroundColor Green
        Start-Sleep -Seconds 1
    }
}

Write-Host "Starting Next.js dev server on port $Port..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host ""

if (-not $NoBrowser) {
    # Open browser after a short delay
    Start-Job {
        Start-Sleep -Seconds 3
        Start-Process "http://localhost:3000"
    } | Out-Null
}

# Start the dev server
npm run dev
