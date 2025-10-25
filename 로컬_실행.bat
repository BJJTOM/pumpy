@echo off
chcp 65001 >nul
cls
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          🚀 펌피 로컬 실행 시작                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ⏰ 시작: %time%
echo.

cd /d "%~dp0"

REM ================================================================
REM 백엔드 실행 (Django)
REM ================================================================
echo [1/4] 🐍 Django 백엔드 시작...
cd gym_api

REM 가상환경 활성화
call venv\Scripts\activate.bat

REM 마이그레이션
echo    - 마이그레이션 실행...
python manage.py makemigrations 2>nul
python manage.py migrate
echo    ✅ 마이그레이션 완료

REM Django 서버 시작 (백그라운드)
echo    - Django 서버 시작 (포트 8000)...
start "Django Server" cmd /c "cd /d "%~dp0gym_api" && venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak >nul
echo    ✅ Django 서버 실행 중

cd ..

REM ================================================================
REM 프론트엔드 실행 (Next.js)
REM ================================================================
echo.
echo [2/4] 📦 Next.js 프론트엔드 시작...
cd gym_web

REM 패키지 설치 확인
if not exist "node_modules\" (
    echo    - NPM 패키지 설치 중...
    call npm install
)

REM Next.js 개발 서버 시작 (백그라운드)
echo    - Next.js 서버 시작 (포트 3000)...
start "Next.js Server" cmd /c "cd /d "%~dp0gym_web" && npm run dev"
timeout /t 5 /nobreak >nul
echo    ✅ Next.js 서버 실행 중

cd ..

REM ================================================================
REM 상태 확인
REM ================================================================
echo.
echo [3/4] 📊 서비스 상태 확인...
timeout /t 2 /nobreak >nul

netstat -an | findstr ":8000" >nul
if %errorlevel% equ 0 (
    echo    ✅ Django 백엔드: http://localhost:8000
) else (
    echo    ⚠️  Django 백엔드: 확인 필요
)

netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo    ✅ Next.js 프론트엔드: http://localhost:3000
) else (
    echo    ⚠️  Next.js 프론트엔드: 확인 필요
)

REM ================================================================
REM 완료
REM ================================================================
echo.
echo [4/4] ✅ 실행 완료!
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🎉 서버 실행 완료!                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 접속 주소:
echo    ┌─────────────────────────────────────────────┐
echo    │  프론트엔드: http://localhost:3000          │
echo    │  백엔드 API: http://localhost:8000/api/     │
echo    │  관리자페이지: http://localhost:8000/admin/ │
echo    └─────────────────────────────────────────────┘
echo.
echo 💡 팁:
echo    • 서버를 중지하려면 열린 창들을 닫으세요
echo    • Django 관리자: python manage.py createsuperuser
echo.
echo ⏰ 완료: %time%
echo.
echo 🌐 브라우저에서 http://localhost:3000 를 열어보세요!
echo.
pause

