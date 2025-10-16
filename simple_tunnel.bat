@echo off
chcp 65001 >nul
color 0A

echo.
echo ==========================================
echo   COCO - 인터넷 URL 생성
echo ==========================================
echo.

echo [단계 1] 백엔드 터널 생성 중...
start "COCO-Backend" cmd /k "color 2F && title COCO 백엔드 터널 && echo. && echo ========================================== && echo   백엔드 터널 (복사하세요!) && echo ========================================== && echo. && cd /d C:\Users\guddn\Downloads\COCO && lt --port 8000"

timeout /t 8 /nobreak >nul

echo [단계 2] 프론트엔드 터널 생성 중...
start "COCO-Frontend" cmd /k "color 1F && title COCO 프론트엔드 터널 (접속 URL) && echo. && echo ========================================== && echo   프론트엔드 터널 (이 URL로 접속!) && echo ========================================== && echo. && cd /d C:\Users\guddn\Downloads\COCO && lt --port 3000"

echo.
echo ==========================================
echo   ✓ 완료!
echo ==========================================
echo.
echo 2개의 창이 열렸습니다:
echo.
echo   1. 초록색 창: 백엔드 URL
echo   2. 파란색 창: 프론트엔드 URL (접속!)
echo.
echo 파란색 창의 URL로 접속하세요!
echo.
pause



