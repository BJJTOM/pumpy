@echo off
chcp 65001 >nul
cls
echo ==========================================
echo   펌피 앱 네이티브 빌드 및 설치
echo ==========================================
echo.

set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%

echo [1/4] 에뮬레이터 확인 중...
echo.

adb devices | findstr "emulator" >nul
if %ERRORLEVEL% EQU 0 (
    echo      에뮬레이터 실행 중 확인!
) else (
    echo      에뮬레이터 시작 중...
    start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_6_API_34
    echo      30초 대기...
    timeout /t 30 /nobreak >nul
)

echo.
echo [2/4] Metro 서버 시작...
cd /d C:\Users\guddn\Downloads\COCO\pumpy-app
start "Metro Bundler" cmd /k "title Metro Bundler && color 0A && echo ========================================== && echo   Metro 번들러 && echo ========================================== && echo. && npx react-native start"

echo      Metro 서버 창 열림!
echo.

echo [3/4] Metro 준비 대기 (20초)...
timeout /t 20 /nobreak >nul
echo.

echo [4/4] 펌피 앱 빌드 및 설치...
echo      (첫 빌드는 2-3분 소요)
echo.

npx react-native run-android

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo   완료!
    echo ==========================================
    echo.
    echo 펌피 앱이 에뮬레이터에 독립 설치됨!
    echo.
    echo Hot Reload 활성화:
    echo   - 코드 수정하고 저장하면
    echo   - 에뮬레이터에서 즉시 반영!
    echo.
) else (
    echo.
    echo 오류 발생
    echo 다시 시도하거나 문의해주세요
    echo.
)

pause

