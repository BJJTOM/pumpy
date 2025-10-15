@echo off
chcp 65001 >nul
echo ========================================
echo   🌐 Pumpy 외부 접속 터널 시작
echo ========================================
echo.

echo [1/3] Frontend 터널 시작 중...
start "Frontend Tunnel" cmd /k "lt --port 3000 --subdomain pumpy-app-2025"
timeout /t 3 >nul

echo [2/3] Backend 터널 시작 중...
start "Backend Tunnel" cmd /k "lt --port 8000 --subdomain pumpy-api-2025"
timeout /t 3 >nul

echo.
echo ========================================
echo   ✅ 터널 시작 완료!
echo ========================================
echo.
echo 📱 APK에 입력할 URL:
echo    https://pumpy-app-2025.loca.lt
echo.
echo 🔗 웹 브라우저 접속:
echo    https://pumpy-app-2025.loca.lt
echo.
echo ⚠️  주의사항:
echo    1. 처음 접속 시 IP 입력 화면이 나오면
echo       "Click to Continue" 클릭
echo    2. 터널 창을 닫지 마세요
echo    3. 무료 서비스로 일시적으로 연결이 끊길 수 있습니다
echo.
echo ========================================
pause
