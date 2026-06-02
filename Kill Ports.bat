@echo off
:: Blis Club - Kill Development Server Ports
:: Double-click to run. Requires PowerShell.

cd /d "%~dp0"

powershell -ExecutionPolicy Bypass -File "%~dp0kill-ports.ps1"

echo.
pause
