@echo off
echo ========================================
echo   펌피 앱 외부 접속 시작
echo ========================================
echo.

REM ngrok 설치 확인
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] ngrok이 설치되어 있지 않습니다.
    echo.
    echo 설치 방법:
    echo 1. https://ngrok.com/download 에서 다운로드
    echo 2. ngrok.exe를 C:\Windows\System32\ 또는 PATH에 추가
    echo 3. ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

echo [1/4] 백엔드 서버 시작 중...
start "Django Backend" cmd /k "cd gym_api && .\.venv\Scripts\python manage.py runserver 0.0.0.0:8000"
timeout /t 5 /nobreak >nul

echo [2/4] 프론트엔드 서버 시작 중...
start "Next.js Frontend" cmd /k "cd gym_web && npm run dev"
timeout /t 10 /nobreak >nul

echo [3/4] Ngrok 터널 시작 중 (프론트엔드)...
start "Ngrok Frontend" cmd /k "ngrok http 3000 --log=stdout"
timeout /t 3 /nobreak >nul

echo [4/4] Ngrok 터널 시작 중 (백엔드)...
start "Ngrok Backend" cmd /k "ngrok http 8000 --log=stdout"

echo.
echo ========================================
echo   모든 서버가 시작되었습니다!
echo ========================================
echo.
echo 다음 단계:
echo 1. Ngrok 창에서 URL 확인 (예: https://xxxx.ngrok.io)
echo 2. 프론트엔드 URL을 앱 설정에 입력
echo 3. 백엔드 URL은 자동으로 감지됩니다
echo.
echo 종료하려면 모든 CMD 창을 닫으세요.
echo ========================================
pause


