# AWS 서버 배포 스크립트 (Windows PowerShell)

$AWS_HOST = "ubuntu@3.27.28.175"
$AWS_KEY = "C:\Users\guddn\Downloads\labsuser.pem"

Write-Host "🚀 AWS 서버로 배포 시작..." -ForegroundColor Green

# 1. 파일 압축
Write-Host "`n📦 1단계: 파일 압축 중..." -ForegroundColor Cyan
Push-Location C:\Users\guddn\Downloads\COCO

# PowerShell에서 tar 사용
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
  --exclude='node_modules'

if (-not (Test-Path "gym_api_update.tar.gz")) {
    Write-Host "❌ 압축 실패!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 압축 완료: gym_api_update.tar.gz" -ForegroundColor Green

# 2. 서버로 전송
Write-Host "`n📤 2단계: 서버로 파일 전송 중..." -ForegroundColor Cyan
scp -i $AWS_KEY gym_api_update.tar.gz "${AWS_HOST}:~/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 파일 전송 실패!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 파일 전송 완료" -ForegroundColor Green

# 3. 서버에서 업데이트 및 재시작
Write-Host "`n🔄 3단계: 서버 업데이트 및 재시작..." -ForegroundColor Cyan

$commands = @"
# 압축 해제
cd ~/gym
tar -xzf ~/gym_api_update.tar.gz --overwrite

# 가상환경 활성화
source venv/bin/activate

# Django 업데이트
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# Gunicorn 재시작
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# 상태 확인
echo "✅ 서비스 상태:"
sudo systemctl status gunicorn --no-pager -l 0

# 최근 로그 확인
echo ""
echo "📋 최근 로그:"
sudo journalctl -u gunicorn -n 10 --no-pager

# 정리
rm ~/gym_api_update.tar.gz

echo ""
echo "✅ 서버 업데이트 완료!"
"@

ssh -i $AWS_KEY $AWS_HOST $commands

# 4. 로컬 정리
Write-Host "`n🧹 4단계: 로컬 임시 파일 정리..." -ForegroundColor Cyan
Remove-Item gym_api_update.tar.gz -ErrorAction SilentlyContinue

Write-Host "`n✅ 배포 완료!" -ForegroundColor Green
Write-Host "🌐 서버 주소: http://3.27.28.175" -ForegroundColor Yellow
Write-Host "🔍 API 확인: http://3.27.28.175/api/" -ForegroundColor Yellow
Write-Host "📱 앱 확인: http://3.27.28.175/app" -ForegroundColor Yellow
Write-Host ""

