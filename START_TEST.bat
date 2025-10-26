@echo off
chcp 65001 >nul
echo ========================================
echo   🚀 펌피 앱 테스트 서버 시작
echo ========================================
echo.
echo 📱 Expo Go 앱을 폰에 설치해주세요:
echo    - Android: Play Store에서 "Expo Go" 검색
echo    - iOS: App Store에서 "Expo Go" 검색
echo.
echo 🔄 Metro 번들러 시작 중...
echo.

cd pumpy-app
npm start

pause

