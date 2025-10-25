# AWS 배포 - API 방식 (SSH 없이)
# EC2 Instance Connect를 통한 배포

$AWS_IP = "3.27.28.175"
$INSTANCE_ID = "" # EC2 인스턴스 ID

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "🚀 AWS 배포 - 대안 방법" -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# 배포 명령어 생성
$deployScript = @'
#!/bin/bash
set -e

echo "🚀 배포 시작..."

# 프로젝트로 이동 또는 클론
cd ~/pumpy 2>/dev/null || (cd ~ && git clone https://github.com/BJJTOM/pumpy.git && cd pumpy)

# 최신 코드 가져오기
git fetch origin
git reset --hard origin/main
git pull origin main

echo "✅ 코드 업데이트 완료"

# Django 백엔드
echo "🐍 Django 배포 중..."
cd gym_api
source venv/bin/activate 2>/dev/null || (python3 -m venv venv && source venv/bin/activate)
pip install -q -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
sudo systemctl status gunicorn --no-pager | head -n 3

echo "✅ Django 완료"

# Next.js 프론트엔드 (최적화)
echo "⚛️  Next.js 배포 중..."
cd ../gym_web

# node_modules 캐시 활용
if [ -d "node_modules" ]; then
    echo "📦 기존 패키지 사용 (빠른 설치)"
    npm install --prefer-offline --no-audit
else
    echo "📦 패키지 설치 중..."
    npm install --no-audit
fi

# 빌드 최적화
echo "🏗️  빌드 중 (5-10분)..."
export NODE_OPTIONS="--max-old-space-size=3072"
export NEXT_TELEMETRY_DISABLED=1

# 기존 빌드 삭제
rm -rf .next

# 빌드 실행
npm run build 2>&1 | grep -E "(Compiled|error|warn)" || true

echo "✅ Next.js 빌드 완료"

# PM2로 실행
pm2 delete gym-web 2>/dev/null || true
pm2 start npm --name "gym-web" -- start
pm2 save
pm2 status

echo "✅ PM2 시작 완료"

# Nginx 재시작
echo "🌐 Nginx 재시작..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -n 3

# 테스트
echo ""
echo "🧪 API 테스트..."
curl -s http://localhost:8000/api/members/ | head -n 3 || echo "API 응답 대기 중..."

echo ""
echo "========================================"
echo "🎉 배포 완료!"
echo "========================================"
echo "접속: http://3.27.28.175"
'@

# 배포 스크립트를 파일로 저장
$deployScript | Out-File -FilePath "C:\Users\guddn\Downloads\COCO\deploy_script.sh" -Encoding UTF8 -NoNewline

Write-Host "📝 배포 스크립트 생성 완료" -ForegroundColor Green
Write-Host ""
Write-Host "다음 방법으로 배포하세요:" -ForegroundColor Yellow
Write-Host ""
Write-Host "방법 1: AWS Systems Manager (Session Manager)" -ForegroundColor Cyan
Write-Host "  1. https://console.aws.amazon.com/ec2/" -ForegroundColor White
Write-Host "  2. 인스턴스 선택 > 연결 > Session Manager" -ForegroundColor White
Write-Host "  3. 아래 명령어 복사 & 붙여넣기" -ForegroundColor White
Write-Host ""
Write-Host "방법 2: AWS CloudShell" -ForegroundColor Cyan
Write-Host "  1. AWS 콘솔 우측 상단 CloudShell 아이콘 클릭" -ForegroundColor White
Write-Host "  2. 아래 명령어 실행" -ForegroundColor White
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "배포 명령어 (복사하세요):" -ForegroundColor Yellow
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
Write-Host $deployScript -ForegroundColor Green
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan

# 클립보드에 복사
$deployScript | Set-Clipboard
Write-Host "✅ 명령어가 클립보드에 복사되었습니다!" -ForegroundColor Green


