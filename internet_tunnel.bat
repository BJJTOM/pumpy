@echo off
echo ==========================================
echo COCO - Internet Tunnel Setup
echo ==========================================
echo.
echo Starting tunnels...
echo.

REM Backend Tunnel
start "COCO Backend (Port 8000)" cmd /k "echo === COCO Backend Tunnel === && echo. && echo Starting tunnel for port 8000... && echo. && ssh -R 80:localhost:8000 serveo.net"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Frontend Tunnel
start "COCO Frontend (Port 3000)" cmd /k "echo === COCO Frontend Tunnel === && echo. && echo Starting tunnel for port 3000... && echo. && ssh -R 80:localhost:3000 serveo.net"

echo.
echo ==========================================
echo Tunnels started!
echo ==========================================
echo.
echo Check the CMD windows for URLs
echo URLs will look like: https://xxxxx.serveo.net
echo.
echo Press any key to exit...
pause >nul


