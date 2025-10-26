@echo off
chcp 65001 > nul
title Pumpy 앱 실행

echo.
echo ═══════════════════════════════════════════
echo    🚀 Pumpy 앱 Metro Bundler 실행
echo ═══════════════════════════════════════════
echo.

REM 1. 포트 포워딩 설정
echo [1/3] 에뮬레이터 포트 설정 중...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  adb를 찾을 수 없습니다. Android Studio를 설치했는지 확인하세요.
    echo.
    pause
    exit /b 1
)
echo ✅ 포트 설정 완료
echo.

REM 2. Metro Bundler 시작
echo [2/3] Metro Bundler 시작 중...
echo 💡 새 터미널 창이 열립니다. 그 창을 닫지 마세요!
echo.
start "Metro Bundler - 이 창을 닫지 마세요!" cmd /k "cd /d %~dp0PumpyApp && npm start"

REM 3. 대기
echo [3/3] Metro Bundler 초기화 대기 중...
timeout /t 8 /nobreak > nul
echo ✅ 준비 완료!
echo.

echo ═══════════════════════════════════════════
echo    📱 이제 에뮬레이터에서 앱을 로드하세요!
echo ═══════════════════════════════════════════
echo.
echo 방법 1: 에뮬레이터의 빨간 화면에서
echo         "RELOAD (R, R)" 버튼 클릭
echo.
echo 방법 2: 에뮬레이터 화면에서 R 키를 두 번 빠르게 누르기
echo.
echo 방법 3: 에뮬레이터에서 Ctrl+M 눌러서
echo         개발자 메뉴 열고 "Reload" 선택
echo.
echo ═══════════════════════════════════════════
echo.
echo ⚠️  주의: Metro Bundler 터미널을 닫지 마세요!
echo.
pause

