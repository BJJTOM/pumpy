@echo off
chcp 65001 > nul
echo.
echo ================================================================
echo   펌피 (Pumpy) 헬스장 관리 시스템 시작
echo ================================================================
echo.

echo [1/3] 백엔드 서버 시작 중...
start "Pumpy Backend" cmd /k "cd /d %~dp0gym_api && .venv\Scripts\python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak > nul

echo [2/3] 프론트엔드 서버 시작 중...
start "Pumpy Frontend" cmd /k "cd /d %~dp0gym_web && set NEXT_PUBLIC_API_BASE=http://localhost:8000/api && npm run dev"
timeout /t 2 /nobreak > nul

echo [3/3] 완료!
echo.
echo ================================================================
echo   서버가 시작되었습니다!
echo ================================================================
echo.
echo   관리자 페이지: http://localhost:3000
echo   회원 앱: http://localhost:3000/app
echo   회원 신청: http://localhost:3000/signup
echo.
echo   모바일 (같은 WiFi): http://172.30.1.44:3000
echo.
echo ================================================================
echo.
echo 브라우저가 자동으로 열립니다...
timeout /t 5 /nobreak > nul
start http://localhost:3000
echo.
echo 서버를 종료하려면 이 창과 열린 창들을 모두 닫으세요.
pause











