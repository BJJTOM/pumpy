@echo off
chcp 65001 >nul
echo ==========================================
echo   🚀 에뮬레이터 + 펌피 앱 자동 실행
echo ==========================================
echo.

set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk

echo 1단계: 에뮬레이터 실행 중...
echo.
start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_6_API_34

echo ✅ 에뮬레이터 시작됨!
echo.
echo 2단계: 30초 대기 (에뮬레이터 부팅 중...)
timeout /t 30 /nobreak >nul

echo.
echo 3단계: ADB 연결 확인 중...
"%ANDROID_HOME%\platform-tools\adb.exe" devices
echo.

echo 4단계: Metro 서버 + 앱 설치 시작...
echo    (새 창이 열립니다)
echo.

cd /d C:\Users\guddn\Downloads\COCO\pumpy-app

REM 새 창에서 Metro 서버 시작
start "Metro Server" cmd /k "echo ========================================== && echo   Metro 서버 실행 중 && echo ========================================== && echo. && npm start"

echo.
echo ⏳ Metro 서버 준비 대기 (15초)...
timeout /t 15 /nobreak >nul

echo.
echo 5단계: 앱 설치 및 실행...
echo    (1-2분 소요)
echo.

REM React Native 앱 실행
call npx react-native run-android

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo   🎉 완료!
    echo ==========================================
    echo.
    echo ✅ 펌피 앱이 에뮬레이터에서 실행 중입니다!
    echo.
    echo 💡 이제 코드를 수정하세요:
    echo    1. VS Code 열기
    echo    2. pumpy-app\src\screens\home\HomeScreen.tsx 수정
    echo    3. Ctrl+S 저장
    echo    4. 에뮬레이터에서 즉시 반영! ⚡
    echo.
) else (
    echo.
    echo ❌ 앱 설치 중 오류 발생
    echo.
    echo 💡 해결 방법:
    echo    1. Metro 서버 창이 열렸는지 확인
    echo    2. 에뮬레이터가 완전히 부팅되었는지 확인
    echo    3. 이 배치 파일을 다시 실행
    echo.
)

echo.
pause

