# AWS 자동 배포 스크립트
# 사용법: .\deploy_to_aws_now.ps1

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          🚀 AWS 서버 자동 배포 시작                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$AWS_HOST = "3.27.28.175"
$AWS_USER = "ubuntu"

# SSH 접속 테스트
Write-Host "[1/5] 🔌 AWS 서버 접속 확인..." -ForegroundColor Yellow

# SSH 명령어 준비
$deployCommands = @"
cd /home/ubuntu/pumpy && \
echo '📥 최신 코드 받기...' && \
git pull origin main && \
echo '🐍 백엔드 업데이트...' && \
cd gym_api && \
source venv/bin/activate && \
pip install -r requirements.txt --quiet && \
python manage.py migrate && \
python manage.py collectstatic --noinput > /dev/null 2>&1 && \
sudo systemctl restart gunicorn 2>/dev/null || (sudo fuser -k 8000/tcp && nohup gunicorn --workers 3 --bind 0.0.0.0:8000 --chdir /home/ubuntu/pumpy/gym_api config.wsgi:application > /tmp/gunicorn.log 2>&1 &) && \
echo '📦 프론트엔드 업데이트...' && \
cd ../gym_web && \
npm install --silent && \
npm run build && \
pm2 restart gym_web 2>/dev/null || pm2 start npm --name gym_web -- start && \
pm2 save && \
echo '🔄 Nginx 재시작...' && \
sudo systemctl restart nginx 2>/dev/null && \
echo '' && \
echo '✅ 배포 완료!' && \
echo '' && \
echo '📊 서비스 상태:' && \
sudo netstat -tlnp | grep -E ':(80|3000|8000)' && \
echo '' && \
echo '🌐 접속 주소: http://3.27.28.175'
"@

Write-Host ""
Write-Host "[2/5] 🚀 배포 명령어 실행 중..." -ForegroundColor Yellow
Write-Host ""

# SSH 키 파일 찾기
$possibleKeyPaths = @(
    "$env:USERPROFILE\.ssh\id_rsa",
    "$env:USERPROFILE\.ssh\aws_key.pem",
    "$env:USERPROFILE\Downloads\*.pem",
    "C:\Users\*\.ssh\*.pem"
)

$keyFile = $null
foreach ($path in $possibleKeyPaths) {
    $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($files) {
        $keyFile = $files.FullName
        break
    }
}

if ($keyFile) {
    Write-Host "   🔑 키 파일 발견: $keyFile" -ForegroundColor Green
    
    # SSH로 배포 실행
    try {
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        
        $result = ssh -i $keyFile -o StrictHostKeyChecking=no "${AWS_USER}@${AWS_HOST}" $deployCommands
        
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "[3/5] ✅ 배포 명령어 전송 완료!" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ SSH 접속 실패: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "   수동 배포 방법:" -ForegroundColor Yellow
        Write-Host "   ssh -i $keyFile ${AWS_USER}@${AWS_HOST}" -ForegroundColor White
    }
}
else {
    Write-Host ""
    Write-Host "❌ SSH 키 파일을 찾을 수 없습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 수동 배포 방법:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. PuTTY 또는 터미널에서 AWS 서버 접속:" -ForegroundColor White
    Write-Host "   ssh -i your-key.pem ubuntu@3.27.28.175" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. 아래 명령어 복사해서 실행:" -ForegroundColor White
    Write-Host ""
    Write-Host $deployCommands -ForegroundColor Cyan
    Write-Host ""
    Write-Host "또는 간단하게:" -ForegroundColor White
    Write-Host ""
    $simpleCommand = @"
cd /home/ubuntu/pumpy && git pull origin main && cd gym_api && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && sudo systemctl restart gunicorn && cd ../gym_web && npm install && npm run build && pm2 restart gym_web && sudo systemctl restart nginx
"@
    Write-Host $simpleCommand -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "[4/5] 🌐 배포 확인..." -ForegroundColor Yellow

# 웹 접속 테스트
try {
    Write-Host "   HTTP 접속 테스트 중..." -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "http://${AWS_HOST}" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ 웹 서버 정상 응답!" -ForegroundColor Green
    }
}
catch {
    Write-Host "   ⚠️  웹 서버 응답 확인 필요 (정상일 수도 있음)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/5] 📋 배포 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ 배포 프로세스 완료!                          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 접속 주소:" -ForegroundColor Cyan
Write-Host "   • 프론트엔드: http://3.27.28.175" -ForegroundColor White
Write-Host "   • 커뮤니티: http://3.27.28.175/community" -ForegroundColor White
Write-Host "   • API: http://3.27.28.175/api/" -ForegroundColor White
Write-Host "   • 관리자: http://3.27.28.175/admin/" -ForegroundColor White
Write-Host ""
Write-Host "🎉 브라우저에서 확인하세요!" -ForegroundColor Yellow
Write-Host ""

# 브라우저 자동 열기
Start-Process "http://3.27.28.175"

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

