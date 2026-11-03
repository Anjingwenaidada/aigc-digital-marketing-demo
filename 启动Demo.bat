@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动 AIGC 数字营销平台 Demo...
echo.
if not exist node_modules (
  echo 首次运行需要安装依赖，请保持网络连接。
  npm.cmd install
  if errorlevel 1 (
    echo.
    echo 依赖安装失败，请检查 Node.js 和网络环境。
    pause
    exit /b 1
  )
)
echo.
echo 服务启动后将自动打开 http://localhost:3000/
echo 不要关闭这个窗口。
echo.
set "CLOUDFLARE_CF_FETCH_ENABLED=false"
start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "$url='http://localhost:3000/'; for($i=0; $i -lt 120; $i++){ try { $response=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2; if($response.StatusCode -eq 200){ Start-Process $url; break } } catch {}; Start-Sleep -Seconds 1 }"
npm.cmd run dev -- --host localhost
pause
