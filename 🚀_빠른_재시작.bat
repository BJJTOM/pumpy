@echo off
chcp 65001 > nul
title Pumpy 앱 빠른 재시작

echo.
echo ╔════════════════════════════════════════════╗
echo ║   🚀 Pumpy 앱 빠른 재시작                ║
echo ╚════════════════════════════════════════════╝
echo.

REM 기존 프로세스 중지
echo [1/4] 기존 프로세스 중지...
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak > nul
echo ✅ 완료
echo.

REM 포트 설정
echo [2/4] 포트 설정...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
echo ✅ 완료
echo.

REM Metro Bundler 시작
echo [3/4] Metro Bundler 시작...
cd /d "%~dp0PumpyApp"
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"
timeout /t 8 /nobreak > nul
echo ✅ 완료
echo.

REM 앱 다시 로드
echo [4/4] 앱 다시 로드...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" shell input text "RR"
echo ✅ 완료
echo.

echo ╔════════════════════════════════════════════╗
echo ║          ✅ 재시작 완료!                  ║
echo ╚════════════════════════════════════════════╝
echo.
echo 📱 에뮬레이터를 확인하세요!
echo.
pause

