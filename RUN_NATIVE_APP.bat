@echo off
chcp 65001 >nul
cls
echo ==========================================
echo   Pumpy Native App Build
echo ==========================================
echo.

set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%

cd /d C:\Users\guddn\Downloads\COCO\pumpy-app

echo [1/3] Check Emulator...
echo.

adb devices | findstr "emulator" >nul
if %ERRORLEVEL% EQU 0 (
    echo      Emulator is running!
) else (
    echo      Starting emulator...
    start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_6_API_34
    echo      Waiting 30 seconds...
    timeout /t 30 /nobreak >nul
)

echo.
echo [2/3] Start Metro Bundler...
start "Metro Bundler" cmd /k "title Metro Bundler && color 0A && cd /d C:\Users\guddn\Downloads\COCO\pumpy-app && echo ========================================== && echo   Metro Bundler && echo ========================================== && echo. && npx react-native start"

echo      Metro window opened!
echo      Waiting 20 seconds...
timeout /t 20 /nobreak >nul
echo.

echo [3/3] Build and Install Pumpy App...
echo      (First build: 2-3 minutes)
echo.

npx react-native run-android

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo   SUCCESS!
    echo ==========================================
    echo.
    echo Pumpy app installed on emulator!
    echo.
    echo Hot Reload is active:
    echo   - Edit code and save
    echo   - Changes appear instantly!
    echo.
) else (
    echo.
    echo Build failed
    echo Please check Metro Bundler window
    echo.
)

pause

