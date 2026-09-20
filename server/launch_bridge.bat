@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
tasklist | findstr /i "python.exe" | findstr /i "8765" >nul
start /b python server\dsh_bridge.py > server\bridge_runtime.log 2>&1
exit
