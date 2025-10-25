@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🚀 Pumpy Local Server Start                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Kill any existing processes on ports 8000 and 3000
echo Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 /nobreak >nul

echo.
echo [1/2] Starting Django Backend (Port 8000)...
start "Django Backend - Port 8000" cmd /k "cd /d "%~dp0gym_api" && venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Next.js Frontend (Port 3000)...
start "Next.js Frontend - Port 3000" cmd /k "cd /d "%~dp0gym_web" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              ✅ Servers Starting...                          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Two terminal windows will open:
echo   1. Django Backend  (Port 8000)
echo   2. Next.js Frontend (Port 3000)
echo.
echo Please wait 10-15 seconds for servers to start, then visit:
echo.
echo   🌐 Frontend:  http://localhost:3000
echo   🔌 API:       http://localhost:8000/api/
echo   ⚙️  Admin:     http://localhost:8000/admin/
echo.
echo To stop servers: Close the terminal windows
echo.

REM Wait and check ports
timeout /t 10 /nobreak >nul

echo Checking server status...
netstat -an | findstr ":8000.*LISTENING" >nul && echo   ✅ Django is running on port 8000 || echo   ⚠️  Django not detected yet, please check the Django window
netstat -an | findstr ":3000.*LISTENING" >nul && echo   ✅ Next.js is running on port 3000 || echo   ⚠️  Next.js not detected yet, please check the Next.js window

echo.
echo Press any key to open browser...
pause >nul

start http://localhost:3000

echo.
echo Done! You can close this window.
echo.
timeout /t 3 >nul
