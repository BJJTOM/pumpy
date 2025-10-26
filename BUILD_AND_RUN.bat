@echo off
chcp 65001 >nul
cls
echo ==========================================
echo   Pumpy App - Native Build and Run
echo ==========================================
echo.

set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%

cd /d C:\Users\guddn\Downloads\COCO\pumpy-app

echo [1/4] Checking emulator...
echo.
adb devices | findstr "emulator" >nul
if %ERRORLEVEL% EQU 0 (
    echo      Emulator is running!
) else (
    echo      Starting emulator...
    start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_6_API_34
    echo      Waiting 40 seconds for boot...
    timeout /t 40 /nobreak >nul
)

echo.
echo [2/4] Starting Metro Bundler...
echo.
start "Metro Bundler" cmd /k "title Metro Bundler && color 0A && cd /d C:\Users\guddn\Downloads\COCO\pumpy-app && echo ========================================== && echo   Metro Bundler Running && echo ========================================== && echo. && echo Starting... && echo. && npx react-native start --port 8081"

echo      Metro window opened!
echo      Waiting 25 seconds...
timeout /t 25 /nobreak >nul

echo.
echo [3/4] Building React Native app...
echo      (This will take 2-3 minutes for first build)
echo.

npx react-native run-android --port 8081

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo   SUCCESS! 
    echo ==========================================
    echo.
    echo Pumpy app is now running on emulator!
    echo.
    echo Hot Reload is ACTIVE:
    echo   1. Open VS Code
    echo   2. Edit any file in pumpy-app/src/
    echo   3. Save (Ctrl+S)
    echo   4. See changes instantly in emulator!
    echo.
    echo Metro Bundler is running in the green window.
    echo Keep it open for Hot Reload to work.
    echo.
) else (
    echo.
    echo ==========================================
    echo   Build Error
    echo ==========================================
    echo.
    echo Please check:
    echo   - Metro Bundler window for errors
    echo   - Emulator is fully booted
    echo   - Run this script again
    echo.
)

echo.
pause

