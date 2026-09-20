@echo off
chcp 65001 >nul
echo ========================================================
echo   正在为 DSH Web Sensor 注册浏览器一键启动协议 (dshbridge://)...
echo ========================================================

set CURRENT_DIR=%~dp0
set LAUNCH_BAT=%CURRENT_DIR%server\launch_bridge.bat

reg add "HKCU\Software\Classes\dshbridge" /ve /d "URL:DSH Bridge Protocol" /f
reg add "HKCU\Software\Classes\dshbridge" /v "URL Protocol" /d "" /f
reg add "HKCU\Software\Classes\dshbridge\shell\open\command" /ve /d "\"%LAUNCH_BAT%\" \"%%1\"" /f

echo.
echo ========================================================
echo   ✓ 注册成功！现在可在 Chrome 侧边栏中直接点击【一键启动 Bridge】！
echo ========================================================
pause
