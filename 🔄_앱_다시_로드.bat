@echo off
chcp 65001 > nul
title 앱 다시 로드

echo.
echo ═══════════════════════════════════════════
echo    🔄 앱 강제 재로드
echo ═══════════════════════════════════════════
echo.

echo Metro Bundler가 실행 중인지 확인 중...
tasklist /FI "WINDOWTITLE eq Metro Bundler*" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Metro Bundler 실행 중
) else (
    echo ❌ Metro Bundler가 실행되지 않았습니다!
    echo.
    echo "✅_앱_실행하기.bat" 파일을 먼저 실행하세요.
    echo.
    pause
    exit /b 1
)

echo.
echo 에뮬레이터에 앱 다시 로드 명령 전송 중...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" shell input keyevent 82
timeout /t 1 /nobreak > nul
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" shell input text "RR"

echo.
echo ✅ 완료!
echo.
echo 에뮬레이터를 확인하세요.
echo 개발자 메뉴가 열렸다면 "Reload"를 선택하세요.
echo.
pause

