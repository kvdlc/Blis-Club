@echo off
:: Blis Club - Start Development Server
:: Double-click to run. Requires PowerShell.

cd /d "%~dp0"

powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
