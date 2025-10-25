# AWS 간단 배포 스크립트
# Windows PowerShell용

$AWS_IP = "3.27.28.175"
$AWS_USER = "ubuntu"
$AWS_PATH = "/home/ubuntu/pumpy"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AWS 서버 배포 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "대상 서버: $AWS_IP" -ForegroundColor Yellow
Write-Host ""

# 1. 백엔드 업로드
Write-Host "[1/4] 백엔드 코드 업로드 중..." -ForegroundColor Yellow
Write-Host "  - members 앱 업로드..." -ForegroundColor Gray
scp -r gym_api/members ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_api/

Write-Host "  - 설정 파일 업로드..." -ForegroundColor Gray
scp gym_api/config/settings.py ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_api/config/
scp gym_api/config/urls.py ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_api/config/
scp gym_api/requirements.txt ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_api/

Write-Host "  백엔드 업로드 완료!" -ForegroundColor Green
Write-Host ""

# 2. 프론트엔드 업로드
Write-Host "[2/4] 프론트엔드 코드 업로드 중..." -ForegroundColor Yellow
Write-Host "  - app 디렉토리 업로드..." -ForegroundColor Gray
scp -r gym_web/app ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_web/

Write-Host "  - lib 디렉토리 업로드..." -ForegroundColor Gray
scp -r gym_web/lib ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_web/

Write-Host "  - package.json 업로드..." -ForegroundColor Gray
scp gym_web/package.json ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_web/

Write-Host "  프론트엔드 업로드 완료!" -ForegroundColor Green
Write-Host ""

# 3. 백엔드 재시작
Write-Host "[3/4] 백엔드 서버 재시작 중..." -ForegroundColor Yellow
ssh ${AWS_USER}@${AWS_IP} "cd ${AWS_PATH}/gym_api && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && sudo systemctl restart gunicorn"
Write-Host "  백엔드 재시작 완료!" -ForegroundColor Green
Write-Host ""

# 4. 프론트엔드 재시작
Write-Host "[4/4] 프론트엔드 서버 재시작 중..." -ForegroundColor Yellow
ssh ${AWS_USER}@${AWS_IP} "cd ${AWS_PATH}/gym_web && npm install && npm run build && pm2 restart gym_web && pm2 save"
Write-Host "  프론트엔드 재시작 완료!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  배포 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "접속 주소:" -ForegroundColor Cyan
Write-Host "  웹: http://${AWS_IP}:3000" -ForegroundColor White
Write-Host "  앱: http://${AWS_IP}:3000/app" -ForegroundColor White
Write-Host "  API: http://${AWS_IP}:8000/api" -ForegroundColor White
Write-Host ""
Write-Host "브라우저에서 http://${AWS_IP}:3000/app 를 열어 확인하세요!" -ForegroundColor Yellow
Write-Host ""






