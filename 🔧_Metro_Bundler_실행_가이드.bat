@echo off
echo ======================================
echo Metro Bundler 실행 및 앱 연결
echo ======================================
echo.

echo [1단계] PumpyApp 폴더로 이동...
cd PumpyApp

echo.
echo [2단계] Metro Bundler 시작...
echo 새 터미널 창이 열립니다.
start cmd /k "npm start"

echo.
echo [3단계] 5초 대기 중...
timeout /t 5 /nobreak

echo.
echo [4단계] 에뮬레이터와 Metro 연결...
adb reverse tcp:8081 tcp:8081

echo.
echo ======================================
echo 완료! 
echo ======================================
echo.
echo 이제 에뮬레이터에서 앱을 다시 로드하세요:
echo - 에뮬레이터에서 "RELOAD (R, R)" 버튼을 누르거나
echo - 에뮬레이터 화면에서 R 키를 두 번 누르세요
echo.
echo 또는 메뉴에서:
echo - Ctrl+M (Windows) 또는 Cmd+M (Mac)으로 개발자 메뉴 열기
echo - "Reload" 선택
echo.
pause

