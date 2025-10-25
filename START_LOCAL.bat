@echo off
chcp 65001 >nul
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          🚀 Pumpy Local Server Start                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Start Time: %time%
echo.

cd /d "%~dp0"

REM ================================================================
REM Django Backend
REM ================================================================
echo [1/4] 🐍 Starting Django Backend...
cd gym_api

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run migrations
echo    - Running migrations...
python manage.py makemigrations 2>nul
python manage.py migrate
echo    ✅ Migrations complete

REM Start Django server (background)
echo    - Starting Django server (port 8000)...
start "Django Server" cmd /c "cd /d "%~dp0gym_api" && venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak >nul
echo    ✅ Django server running

cd ..

REM ================================================================
REM Next.js Frontend
REM ================================================================
echo.
echo [2/4] 📦 Starting Next.js Frontend...
cd gym_web

REM Check if node_modules exists
if not exist "node_modules\" (
    echo    - Installing NPM packages...
    call npm install
)

REM Start Next.js dev server (background)
echo    - Starting Next.js server (port 3000)...
start "Next.js Server" cmd /c "cd /d "%~dp0gym_web" && npm run dev"
timeout /t 5 /nobreak >nul
echo    ✅ Next.js server running

cd ..

REM ================================================================
REM Status Check
REM ================================================================
echo.
echo [3/4] 📊 Checking service status...
timeout /t 2 /nobreak >nul

netstat -an | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo    ✅ Django Backend: http://localhost:8000
) else (
    echo    ⚠️  Django Backend: Check needed
)

netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo    ✅ Next.js Frontend: http://localhost:3000
) else (
    echo    ⚠️  Next.js Frontend: Check needed
)

REM ================================================================
REM Complete
REM ================================================================
echo.
echo [4/4] ✅ Startup Complete!
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🎉 Servers Running!                             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Access URLs:
echo    ┌─────────────────────────────────────────────┐
echo    │  Frontend:  http://localhost:3000           │
echo    │  API:       http://localhost:8000/api/      │
echo    │  Admin:     http://localhost:8000/admin/    │
echo    └─────────────────────────────────────────────┘
echo.
echo 💡 Tips:
echo    • To stop servers, close the opened windows
echo    • Create admin: python manage.py createsuperuser
echo.
echo Complete Time: %time%
echo.
echo 🌐 Open http://localhost:3000 in your browser!
echo.
pause

