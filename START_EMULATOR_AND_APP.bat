@echo off
chcp 65001 >nul
echo ========================================
echo   📱 에뮬레이터 + 펌피 앱 자동 실행
echo ========================================
echo.
echo 🔍 에뮬레이터 확인 중...
echo.

REM ADB 경로 확인
where adb >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ADB를 찾을 수 없습니다.
    echo.
    echo 💡 해결 방법:
    echo    1. SETUP_ANDROID_ENV.ps1 실행 (관리자 권한)
    echo    2. PowerShell 재시작
    echo    3. 다시 시도
    echo.
    pause
    exit /b 1
)

REM 에뮬레이터 목록 확인
echo 📋 설치된 에뮬레이터:
emulator -list-avds
echo.

REM 에뮬레이터가 이미 실행 중인지 확인
adb devices | find "emulator" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ 에뮬레이터가 이미 실행 중입니다!
    echo.
) else (
    echo 🚀 에뮬레이터 시작 중...
    echo    (백그라운드에서 실행됩니다)
    echo.
    
    REM 첫 번째 AVD 실행 (백그라운드)
    for /f "tokens=*" %%i in ('emulator -list-avds') do (
        start /B emulator -avd %%i
        goto :emulator_started
    )
    
    :emulator_started
    echo ⏳ 에뮬레이터 부팅 대기 중... (약 30-60초)
    echo.
    
    REM 에뮬레이터가 완전히 부팅될 때까지 대기
    :wait_for_boot
    timeout /t 5 /nobreak >nul
    adb devices | find "device" >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo    ... 대기 중
        goto :wait_for_boot
    )
    
    echo ✅ 에뮬레이터 부팅 완료!
    echo.
)

echo 📦 펌피 앱 설치 및 실행...
echo.

cd pumpy-app

REM Metro 서버 시작 (백그라운드)
echo 🔄 Metro 번들러 시작...
start /B npm start

REM Metro가 준비될 때까지 대기
timeout /t 10 /nobreak >nul

echo ✅ Metro 서버 실행 중
echo.

echo 📱 앱을 에뮬레이터에 설치하는 중...
echo    (자동으로 설치되고 실행됩니다)
echo.

REM React Native 앱 실행
npx react-native run-android

echo.
echo ========================================
echo   🎉 완료!
echo ========================================
echo.
echo 💡 개발 팁:
echo    - 코드 수정 후 저장하면 자동 반영됩니다
echo    - Ctrl+M (에뮬레이터) → 개발자 메뉴
echo    - Ctrl+C (터미널) → Metro 서버 종료
echo.

pause

