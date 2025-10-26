# AWS 자동 배포 스크립트
# 사용자 확인 없이 바로 실행

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 AWS 자동 배포 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$AWS_IP = "3.27.28.175"
$AWS_USER = "ubuntu"
$PROJECT_PATH = "/home/ubuntu/pumpy"

Write-Host "📡 AWS 서버 연결 중: $AWS_USER@$AWS_IP" -ForegroundColor Yellow
Write-Host ""

# SSH 명령어 생성
$SSH_COMMANDS = @"
cd $PROJECT_PATH && \
echo '================================================' && \
echo '📥 Git Pull 시작...' && \
echo '================================================' && \
git pull origin main && \
echo '' && \
echo '================================================' && \
echo '🔧 백엔드 업데이트 시작...' && \
echo '================================================' && \
cd gym_api && \
source venv/bin/activate && \
pip install -r requirements.txt --quiet && \
python manage.py makemigrations && \
python manage.py migrate && \
python manage.py collectstatic --noinput && \
echo '✅ 백엔드 업데이트 완료' && \
echo '' && \
echo '🔄 Gunicorn 재시작...' && \
sudo systemctl restart gunicorn && \
sudo systemctl status gunicorn --no-pager | head -n 20 && \
echo '' && \
echo '================================================' && \
echo '🌐 프론트엔드 업데이트 시작...' && \
echo '================================================' && \
cd $PROJECT_PATH/gym_web && \
npm install --silent && \
echo '📦 Next.js 빌드 중...' && \
npm run build && \
echo '✅ 빌드 완료' && \
echo '' && \
echo '🔄 PM2 재시작...' && \
pm2 restart gym_web || pm2 start npm --name 'gym_web' -- start && \
pm2 save && \
pm2 status && \
echo '' && \
echo '================================================' && \
echo '✅ 배포 완료!' && \
echo '================================================' && \
echo '' && \
echo '🌐 접속 주소:' && \
echo '   웹:      http://$AWS_IP/' && \
echo '   API:     http://$AWS_IP/api/' && \
echo '   관리자:  http://$AWS_IP/admin/' && \
echo '' && \
echo '🔍 서비스 상태:' && \
echo '   Gunicorn: 실행 중' && \
echo '   PM2:      실행 중' && \
echo '' && \
echo '================================================'
"@

Write-Host "📋 실행할 명령어:" -ForegroundColor Green
Write-Host $SSH_COMMANDS -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 배포 시작..." -ForegroundColor Green
Write-Host ""

# SSH 실행
try {
    $sshCommand = "ssh -o StrictHostKeyChecking=no $AWS_USER@$AWS_IP `"$SSH_COMMANDS`""
    
    Write-Host "💡 SSH 명령 실행 중..." -ForegroundColor Yellow
    Write-Host ""
    
    # PowerShell에서 SSH 실행
    Invoke-Expression $sshCommand
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 배포 완료!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 웹사이트: http://$AWS_IP/" -ForegroundColor Cyan
    Write-Host "📱 API: http://$AWS_IP/api/" -ForegroundColor Cyan
    Write-Host "👤 관리자: http://$AWS_IP/admin/" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ 배포 실패" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "오류 메시지: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 수동 배포 방법:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. PowerShell에서 실행:" -ForegroundColor White
    Write-Host "   ssh ubuntu@$AWS_IP" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. AWS 서버에서 실행:" -ForegroundColor White
    Write-Host "   cd $PROJECT_PATH" -ForegroundColor Gray
    Write-Host "   git pull" -ForegroundColor Gray
    Write-Host "   cd gym_web && npm run build && pm2 restart gym_web" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
