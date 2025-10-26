@echo off
chcp 65001 >nul
echo ========================================
echo   🚀 펌피 전체 서버 시작
echo ========================================
echo.

REM 기존 프로세스 종료
echo [1/5] 기존 서버 프로세스 종료 중...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 >nul

REM Backend 서버 시작
echo [2/5] Backend 서버 시작 중...
start "Backend Server" cmd /k "cd /d C:\Users\guddn\Downloads\COCO\gym_api && .\.venv\Scripts\python manage.py runserver 0.0.0.0:8000"
timeout /t 5 >nul

REM Frontend 서버 시작
echo [3/5] Frontend 서버 시작 중...
start "Frontend Server" cmd /k "cd /d C:\Users\guddn\Downloads\COCO\gym_web && npm run dev"
timeout /t 10 >nul

REM LocalTunnel - Frontend 시작
echo [4/5] Frontend 터널 시작 중...
start "Frontend Tunnel" cmd /k "cd /d C:\Users\guddn\Downloads\COCO && lt --port 3000 --subdomain pumpy-app-2025"
timeout /t 5 >nul

REM LocalTunnel - Backend 시작
echo [5/5] Backend 터널 시작 중...
start "Backend Tunnel" cmd /k "cd /d C:\Users\guddn\Downloads\COCO && lt --port 8000 --subdomain pumpy-api-2025"
timeout /t 3 >nul

echo.
echo ========================================
echo   ✅ 모든 서버 시작 완료!
echo ========================================
echo.
echo 📍 로컬 접속 (같은 Wi-Fi):
echo    http://172.30.1.44:3000
echo.
echo 🌐 외부 접속 (어디서든):
echo    https://pumpy-app-2025.loca.lt
echo.
echo 📱 랜딩 페이지:
echo    https://pumpy-app-2025.loca.lt/landing
echo.
echo ⚠️  주의사항:
echo    - 이 창들을 닫지 마세요!
echo    - 컴퓨터를 끄면 서비스가 중단됩니다
echo    - LocalTunnel 처음 접속 시 Continue 클릭
echo.
echo ========================================
echo 서버가 계속 실행 중입니다...
pause










