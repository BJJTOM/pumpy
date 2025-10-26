@echo off
chcp 65001 > nul
title Pumpy 앱 완전 재설정 및 실행

echo.
echo ╔════════════════════════════════════════════╗
echo ║   🔧 Pumpy 앱 완전 재설정 및 실행        ║
echo ╚════════════════════════════════════════════╝
echo.

cd /d "%~dp0PumpyApp"

echo [1/7] 기존 Metro Bundler 중지...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul
echo ✅ 완료
echo.

echo [2/7] 캐시 삭제 중...
if exist ".expo" (
    rmdir /s /q .expo
    echo ✅ .expo 삭제
)
if exist "node_modules" (
    echo 📦 node_modules 삭제 중... (시간이 걸릴 수 있습니다)
    rmdir /s /q node_modules
    echo ✅ node_modules 삭제
)
if exist "android\.gradle" (
    rmdir /s /q android\.gradle
    echo ✅ android\.gradle 삭제
)
if exist "android\app\build" (
    rmdir /s /q android\app\build
    echo ✅ android\app\build 삭제
)
echo.

echo [3/7] npm 캐시 정리...
call npm cache clean --force
echo ✅ 완료
echo.

echo [4/7] node_modules 재설치 중...
echo 📦 시간이 좀 걸립니다 (1-3분)...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install 실패
    pause
    exit /b 1
)
echo ✅ 완료
echo.

echo [5/7] Metro Bundler 캐시 삭제...
call npx react-native start --reset-cache --max-workers=2 2>nul &
timeout /t 2 /nobreak > nul
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak > nul
echo ✅ 완료
echo.

echo [6/7] 에뮬레이터 포트 설정...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
echo ✅ 완료
echo.

echo [7/7] Metro Bundler 시작...
echo 💡 새 터미널 창이 열립니다
start "Metro Bundler - 닫지 마세요!" cmd /k "npx react-native start --reset-cache"
timeout /t 8 /nobreak > nul
echo ✅ 완료
echo.

echo ╔════════════════════════════════════════════╗
echo ║          🎉 재설정 완료!                  ║
echo ╚════════════════════════════════════════════╝
echo.
echo 📱 에뮬레이터에서 앱을 다시 로드하세요:
echo.
echo    방법 1: R 키를 두 번 빠르게 누르기
echo    방법 2: "RELOAD" 버튼 클릭
echo    방법 3: Ctrl+M → Reload 선택
echo.
echo ⚠️  Metro Bundler 터미널을 닫지 마세요!
echo.
pause

