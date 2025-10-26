# AWS 직접 배포 스크립트
$AWS_HOST = "ubuntu@3.27.28.175"
$AWS_KEY = "C:\Users\guddn\Downloads\COCO\pumpy-key.pem"

Write-Host "🚀 AWS 서버로 직접 배포 시작..." -ForegroundColor Green
Write-Host "🔑 SSH 키: $AWS_KEY" -ForegroundColor Cyan

# 1. SSH 키 권한 확인
if (-not (Test-Path $AWS_KEY)) {
    Write-Host "❌ SSH 키를 찾을 수 없습니다: $AWS_KEY" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSH 키 찾음" -ForegroundColor Green

# 2. 파일 압축
Write-Host "`n📦 백엔드 파일 압축 중..." -ForegroundColor Cyan
Push-Location C:\Users\guddn\Downloads\COCO

tar -czf gym_api_update.tar.gz `
  -C gym_api `
  config `
  members `
  manage.py `
  requirements.txt `
  db.sqlite3 `
  --exclude='__pycache__' `
  --exclude='*.pyc' `
  --exclude='venv' `
  --exclude='.venv' `
  --exclude='node_modules'

if (-not (Test-Path "gym_api_update.tar.gz")) {
    Write-Host "❌ 압축 실패!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 압축 완료: $(Get-Item gym_api_update.tar.gz | Select-Object -ExpandProperty Length) bytes" -ForegroundColor Green

# 3. 서버로 전송
Write-Host "`n📤 서버로 파일 전송 중..." -ForegroundColor Cyan
scp -i $AWS_KEY -o StrictHostKeyChecking=no gym_api_update.tar.gz "${AWS_HOST}:~/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 파일 전송 실패!" -ForegroundColor Red
    Remove-Item gym_api_update.tar.gz -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "✅ 파일 전송 완료" -ForegroundColor Green

# 4. 서버에서 업데이트 실행
Write-Host "`n🔄 서버 업데이트 및 재시작..." -ForegroundColor Cyan

$commands = @"
echo '=== 1. 파일 압축 해제 ==='
cd ~
tar -xzf gym_api_update.tar.gz -C gym/

echo ''
echo '=== 2. 가상환경 활성화 및 마이그레이션 ==='
cd ~/gym
source venv/bin/activate

python manage.py makemigrations 2>&1 || echo 'Migration 없음'
python manage.py migrate 2>&1 || echo 'Migration 완료'
python manage.py collectstatic --noinput 2>&1 || echo 'Static files 수집 완료'

echo ''
echo '=== 3. Gunicorn 재시작 ==='
sudo systemctl restart gunicorn
sleep 2

echo ''
echo '=== 4. Nginx 재시작 ==='
sudo systemctl restart nginx
sleep 2

echo ''
echo '=== 5. 서비스 상태 확인 ==='
echo '--- Gunicorn 상태 ---'
sudo systemctl status gunicorn --no-pager -l 0 | head -20

echo ''
echo '--- Nginx 상태 ---'
sudo systemctl status nginx --no-pager -l 0 | head -10

echo ''
echo '=== 6. 최근 로그 확인 ==='
echo '--- Gunicorn 로그 (최근 15줄) ---'
sudo journalctl -u gunicorn -n 15 --no-pager

echo ''
echo '=== 7. 에러 확인 ==='
sudo journalctl -u gunicorn --no-pager -n 20 | grep -i error || echo '에러 없음'

echo ''
echo '=== 8. 정리 ==='
rm ~/gym_api_update.tar.gz

echo ''
echo '✅ 배포 완료!'
echo '🌐 서버 주소: http://3.27.28.175'
"@

ssh -i $AWS_KEY -o StrictHostKeyChecking=no $AWS_HOST $commands

# 5. 로컬 정리
Write-Host "`n🧹 로컬 임시 파일 정리..." -ForegroundColor Cyan
Remove-Item gym_api_update.tar.gz -ErrorAction SilentlyContinue
Pop-Location

Write-Host "`n✅ 배포 완료!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "🌐 서버 주소: http://3.27.28.175" -ForegroundColor Cyan
Write-Host "🔍 API 확인: http://3.27.28.175/api/" -ForegroundColor Cyan
Write-Host "📱 앱 확인: http://3.27.28.175/app" -ForegroundColor Cyan
Write-Host "👨‍💼 관리자: http://3.27.28.175/admin/" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "🧪 테스트 계정:" -ForegroundColor Green
Write-Host "   이메일: test@example.com" -ForegroundColor White
Write-Host "   비밀번호: test1234" -ForegroundColor White
Write-Host ""
