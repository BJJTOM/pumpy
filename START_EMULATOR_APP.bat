@echo off
chcp 65001 >nul
cls
echo ==========================================
echo   에뮬레이터 + 펌피 앱 자동 실행
echo ==========================================
echo.

set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk

echo [1/5] 에뮬레이터 실행 중...
start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_6_API_34
echo      에뮬레이터 창이 열렸습니다!
echo.

echo [2/5] 에뮬레이터 부팅 대기 (30초)...
timeout /t 30 /nobreak >nul
echo.

echo [3/5] Metro 서버 시작...
cd /d C:\Users\guddn\Downloads\COCO\pumpy-app
start "Metro Server - npm start" cmd /k "title Metro Server && color 0A && echo ========================================== && echo   Metro 서버 && echo ========================================== && echo. && echo Metro 번들러 시작 중... && echo. && npm start"
echo      Metro 서버 창이 열렸습니다!
echo.

echo [4/5] Metro 준비 대기 (15초)...
timeout /t 15 /nobreak >nul
echo.

echo [5/5] 앱 설치 및 실행 중...
echo      (첫 빌드는 1-2분 소요)
echo.

npx react-native run-android

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo   완료!
    echo ==========================================
    echo.
    echo 펌피 앱이 에뮬레이터에서 실행 중입니다!
    echo.
    echo 이제 Hot Reload 테스트:
    echo   1. VS Code 열기
    echo   2. pumpy-app\src\screens\home\HomeScreen.tsx 수정
    echo   3. Ctrl+S 저장
    echo   4. 에뮬레이터에서 즉시 반영!
    echo.
) else (
    echo.
    echo 오류 발생
    echo.
    echo 해결 방법:
    echo   1. Metro 서버 창 확인
    echo   2. 에뮬레이터 홈 화면 확인
    echo   3. 다시 실행
    echo.
)

pause

