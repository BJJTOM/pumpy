# 🚀 AWS 배포 자동화 스크립트 (PowerShell)
# 로컬의 최신 변경사항을 AWS에 자동 반영합니다

$AWS_IP = "3.27.28.175"
$AWS_USER = "ubuntu"
$AWS_PATH = "/home/ubuntu/pumpy"
$SSH_KEY = "~/.ssh/pumpy-key.pem"  # SSH 키 경로 (있는 경우)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 펌피 AWS 서버 전체 배포 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# SSH 연결 테스트
Write-Host "[테스트] AWS 서버 연결 확인 중..." -ForegroundColor Yellow
$testConnection = ssh ${AWS_USER}@${AWS_IP} "echo 'Connection OK'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS 서버 연결 실패!" -ForegroundColor Red
    Write-Host "다음을 확인하세요:" -ForegroundColor Yellow
    Write-Host "  1. AWS EC2 인스턴스가 실행 중인지" -ForegroundColor Yellow
    Write-Host "  2. 보안 그룹에서 SSH(22) 포트가 열려있는지" -ForegroundColor Yellow
    Write-Host "  3. SSH 키 파일 권한이 올바른지" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "수동 배포 방법:" -ForegroundColor Green
    Write-Host "  AWS 콘솔에서 직접 EC2 접속 후 코드 업로드" -ForegroundColor Green
    exit 1
}

Write-Host "✅ AWS 서버 연결 성공!" -ForegroundColor Green
Write-Host ""

# 1. 백엔드 파일 압축
Write-Host "[1/6] 백엔드 파일 압축 중..." -ForegroundColor Yellow
Compress-Archive -Path gym_api/* -DestinationPath gym_api_deploy.zip -Force

# 2. 프론트엔드 파일 압축 (node_modules 제외)
Write-Host "[2/6] 프론트엔드 파일 압축 중..." -ForegroundColor Yellow
$excludeFiles = @('node_modules', '.next', 'out', '.cache')
Get-ChildItem gym_web -Exclude $excludeFiles | Compress-Archive -DestinationPath gym_web_deploy.zip -Force

# 3. 파일 업로드
Write-Host "[3/6] 파일 업로드 중..." -ForegroundColor Yellow
scp gym_api_deploy.zip ${AWS_USER}@${AWS_IP}:${AWS_PATH}/
scp gym_web_deploy.zip ${AWS_USER}@${AWS_IP}:${AWS_PATH}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 파일 업로드 실패!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 파일 업로드 완료!" -ForegroundColor Green

# 4. AWS 서버에서 배포 스크립트 실행
Write-Host "[4/6] AWS 서버 배포 스크립트 실행 중..." -ForegroundColor Yellow

$deployScript = @"
#!/bin/bash
set -e

echo "========================================="
echo "  AWS 서버 배포 진행 중..."
echo "========================================="

# 백업 생성
echo "[1/8] 기존 파일 백업 중..."
cd ${AWS_PATH}
if [ -d "gym_api_backup" ]; then rm -rf gym_api_backup; fi
if [ -d "gym_web_backup" ]; then rm -rf gym_web_backup; fi
cp -r gym_api gym_api_backup 2>/dev/null || true
cp -r gym_web gym_web_backup 2>/dev/null || true

# 압축 해제
echo "[2/8] 파일 압축 해제 중..."
unzip -o gym_api_deploy.zip -d gym_api/
unzip -o gym_web_deploy.zip -d gym_web/

# 백엔드 업데이트
echo "[3/8] 백엔드 의존성 설치 중..."
cd ${AWS_PATH}/gym_api
source venv/bin/activate || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt --quiet

# 데이터베이스 마이그레이션
echo "[4/8] 데이터베이스 마이그레이션 중..."
python manage.py makemigrations
python manage.py migrate

# Static 파일 수집
echo "[5/8] Static 파일 수집 중..."
python manage.py collectstatic --noinput

# Gunicorn 재시작
echo "[6/8] Gunicorn 재시작 중..."
sudo systemctl restart gunicorn || echo "Gunicorn not configured"

# 프론트엔드 업데이트
echo "[7/8] 프론트엔드 빌드 중..."
cd ${AWS_PATH}/gym_web
npm install --production
npm run build

# PM2 재시작
echo "[8/8] PM2 재시작 중..."
pm2 restart gym_web || pm2 start npm --name "gym_web" -- start
pm2 save

# 정리
cd ${AWS_PATH}
rm -f gym_api_deploy.zip gym_web_deploy.zip

echo ""
echo "========================================="
echo "  ✅ 배포 완료!"
echo "========================================="
echo ""
echo "🌐 접속 URL:"
echo "   웹: http://${AWS_IP}:3000"
echo "   API: http://${AWS_IP}:8000/api"
echo "   관리자: http://${AWS_IP}:8000/admin"
"@

# 배포 스크립트를 AWS에 전송하고 실행
$deployScript | ssh ${AWS_USER}@${AWS_IP} "cat > ${AWS_PATH}/deploy.sh && chmod +x ${AWS_PATH}/deploy.sh && bash ${AWS_PATH}/deploy.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 배포 스크립트 실행 실패!" -ForegroundColor Red
    Write-Host "백업에서 복구하려면 다음 명령어를 실행하세요:" -ForegroundColor Yellow
    Write-Host "  ssh ${AWS_USER}@${AWS_IP}" -ForegroundColor Yellow
    Write-Host "  cd ${AWS_PATH}" -ForegroundColor Yellow
    Write-Host "  mv gym_api_backup gym_api" -ForegroundColor Yellow
    Write-Host "  mv gym_web_backup gym_web" -ForegroundColor Yellow
    exit 1
}

# 5. 서버 상태 확인
Write-Host "[5/6] 서버 상태 확인 중..." -ForegroundColor Yellow
ssh ${AWS_USER}@${AWS_IP} "systemctl is-active gunicorn && pm2 status"

# 6. 정리
Write-Host "[6/6] 로컬 임시 파일 정리 중..." -ForegroundColor Yellow
Remove-Item gym_api_deploy.zip -Force -ErrorAction SilentlyContinue
Remove-Item gym_web_deploy.zip -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ AWS 배포 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 접속 정보:" -ForegroundColor Cyan
Write-Host "   웹사이트: http://${AWS_IP}:3000" -ForegroundColor White
Write-Host "   API: http://${AWS_IP}:8000/api" -ForegroundColor White
Write-Host "   관리자: http://${AWS_IP}:8000/admin" -ForegroundColor White
Write-Host ""
Write-Host "📱 모바일 앱 설정:" -ForegroundColor Cyan
Write-Host "   lib/api.ts 에서 API URL을 다음으로 변경하세요:" -ForegroundColor White
Write-Host "   http://${AWS_IP}:8000/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔍 로그 확인:" -ForegroundColor Cyan
Write-Host "   ssh ${AWS_USER}@${AWS_IP}" -ForegroundColor White
Write-Host "   sudo journalctl -u gunicorn -f" -ForegroundColor White
Write-Host "   pm2 logs gym_web" -ForegroundColor White
Write-Host ""








