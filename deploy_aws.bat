@echo off
chcp 65001 >nul
cls

echo ╔══════════════════════════════════════════════════════════════╗
echo ║          🚀 AWS 서버 배포                                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set AWS_HOST=3.27.28.175
set AWS_USER=ubuntu

echo [1/3] 🔍 배포 방법 안내...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔑 AWS 서버 접속 방법:
echo.
echo 1. PuTTY 또는 Windows Terminal 실행
echo 2. 아래 명령어로 접속:
echo.
echo    ssh -i "your-key.pem" ubuntu@3.27.28.175
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo [2/3] 📋 배포 명령어 (복사해서 AWS 서버에서 실행):
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo cd /home/ubuntu/pumpy ^&^& git pull origin main ^&^& cd gym_api ^&^& source venv/bin/activate ^&^& pip install -r requirements.txt ^&^& python manage.py migrate ^&^& python manage.py collectstatic --noinput ^&^& sudo systemctl restart gunicorn ^&^& cd ../gym_web ^&^& npm install ^&^& npm run build ^&^& pm2 restart gym_web ^&^& sudo systemctl restart nginx ^&^& echo "✅ 배포 완료!"
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo [3/3] 🌐 배포 후 확인할 주소:
echo.
echo    프론트엔드: http://3.27.28.175
echo    커뮤니티: http://3.27.28.175/community
echo    API: http://3.27.28.175/api/
echo    관리자: http://3.27.28.175/admin/
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 💡 배포 순서:
echo    1. 위의 ssh 명령어로 AWS 서버 접속
echo    2. 배포 명령어 복사해서 실행
echo    3. 브라우저에서 http://3.27.28.175 확인
echo.

echo 브라우저를 여시겠습니까? (Y/N)
set /p answer=

if /i "%answer%"=="Y" (
    start http://3.27.28.175
    echo.
    echo ✅ 브라우저를 열었습니다!
)

echo.
echo Press any key to exit...
pause >nul

