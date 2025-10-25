# AWS 배포 자동화 스크립트
# PowerShell에서 실행

$AWS_IP = "3.27.28.175"
$AWS_USER = "ubuntu"

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "🚀 AWS 자동 배포 시작" -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Cyan

# SSH 접속 명령어 생성
$deployCommands = @'
cd ~/pumpy 2>/dev/null || (cd ~ && git clone https://github.com/BJJTOM/pumpy.git && cd pumpy)
git pull origin main
cd gym_api
source venv/bin/activate 2>/dev/null || (python3 -m venv venv && source venv/bin/activate)
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
cd ../gym_web
npm install
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
pm2 delete gym-web 2>/dev/null || true
pm2 start npm --name "gym-web" -- start
pm2 save
sudo systemctl restart nginx
echo "✅ 배포 완료!"
'@

# 임시 파일에 명령어 저장
$tempScript = "C:\Users\guddn\Downloads\COCO\temp_deploy.sh"
$deployCommands | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "📝 배포 스크립트 생성 완료" -ForegroundColor Green
Write-Host ""
Write-Host "다음 방법 중 하나를 선택하세요:" -ForegroundColor Yellow
Write-Host ""
Write-Host "방법 1: SSH로 직접 접속 (권장)" -ForegroundColor Cyan
Write-Host "  ssh $AWS_USER@$AWS_IP" -ForegroundColor White
Write-Host ""
Write-Host "방법 2: AWS 콘솔 사용" -ForegroundColor Cyan
Write-Host "  https://console.aws.amazon.com/ec2/" -ForegroundColor White
Write-Host "  > 인스턴스 선택 > 연결 > Session Manager" -ForegroundColor White
Write-Host ""
Write-Host "방법 3: PuTTY 사용 (Windows)" -ForegroundColor Cyan
Write-Host "  Host: $AWS_IP" -ForegroundColor White
Write-Host "  User: $AWS_USER" -ForegroundColor White
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "접속 후, 다음 명령어를 복사해서 실행하세요:" -ForegroundColor Yellow
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
Write-Host $deployCommands -ForegroundColor Green
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan

# 배포 명령어를 클립보드에 복사
$deployCommands | Set-Clipboard
Write-Host "✅ 배포 명령어가 클립보드에 복사되었습니다!" -ForegroundColor Green
Write-Host "AWS 서버에 접속한 후 Ctrl+V로 붙여넣으세요!" -ForegroundColor Yellow


