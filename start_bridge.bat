@echo off
chcp 65001 >nul
echo ========================================================
echo   DSH (DeepSeek Harness) 本地伴侣网关服务启动中...
echo   突破浏览器沙箱限制，实现 100%% 免授权静默落盘与全模态感知
echo ========================================================
cd /d "%~dp0"
python server\dsh_bridge.py
pause
