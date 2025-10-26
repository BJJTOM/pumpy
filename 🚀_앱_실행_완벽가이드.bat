@echo off
chcp 65001 > nul
echo ╔════════════════════════════════════════╗
echo ║   Pumpy 앱 Metro Bundler 실행        ║
echo ╚════════════════════════════════════════╝
echo.

echo [1단계] 에뮬레이터 연결 설정 중...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
if %errorlevel% neq 0 (
    echo ❌ adb 연결 실패. Android Studio가 설치되어 있는지 확인하세요.
    pause
    exit /b 1
)
echo ✅ 에뮬레이터 연결 완료!
echo.

echo [2단계] PumpyApp 폴더로 이동...
cd /d "%~dp0PumpyApp"
if not exist "package.json" (
    echo ❌ PumpyApp 폴더를 찾을 수 없습니다.
    pause
    exit /b 1
)
echo ✅ PumpyApp 폴더 확인!
echo.

echo [3단계] Metro Bundler 시작 중...
echo 새 터미널 창에서 Metro Bundler가 실행됩니다.
echo.
start "Metro Bundler" cmd /k "npm start"

echo.
echo ╔════════════════════════════════════════╗
echo ║          설정 완료!                   ║
echo ╚════════════════════════════════════════╝
echo.
echo 📱 이제 에뮬레이터에서 앱을 다시 로드하세요:
echo.
echo 방법 1: 에뮬레이터 화면에서 "RELOAD (R, R)" 버튼 클릭
echo.
echo 방법 2: R 키를 두 번 빠르게 누르기
echo.
echo 방법 3: 개발자 메뉴 열기
echo    - 에뮬레이터에서 Ctrl + M 누르기
echo    - "Reload" 선택
echo.
echo 💡 Metro Bundler 터미널이 열려 있어야 합니다!
echo.
pause

