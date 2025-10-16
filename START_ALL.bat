@echo off
chcp 65001 >nul
echo ========================================
echo   🏋️ 펌피 시스템 전체 시작
echo ========================================
echo.

echo [1/3] 백엔드 서버 시작 중...
start "Django Backend" cmd /k "cd gym_api && .\.venv\Scripts\python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak >nul

echo [2/3] 웹 서버 시작 중...
start "Next.js Web" cmd /k "cd gym_web && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] React Native 앱 시작 중...
start "React Native App" cmd /k "cd pumpy-mobile && npx expo start"

echo.
echo ========================================
echo   ✅ 모든 서버가 시작되었습니다!
echo ========================================
echo.
echo 📊 웹 (PC 관리자용):
echo    → http://localhost:3000
echo.
echo 📱 앱 (모바일용):
echo    → Expo Go로 QR 스캔
echo    → 또는 'a' 키로 에뮬레이터
echo.
echo 🌐 외부 접속 (선택):
echo    → 새 터미널에서: ngrok http 3000
echo.
echo 종료하려면 모든 CMD 창을 닫으세요.
echo ========================================
pause


