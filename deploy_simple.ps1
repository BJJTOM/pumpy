# 간단한 AWS 배포 스크립트

$KEY = "C:\Users\guddn\Downloads\COCO\pumpy-key.pem"
$SERVER = "ubuntu@3.27.28.175"
$LOCAL = "C:\Users\guddn\Downloads\COCO\gym_api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS 서버 배포" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 압축
Write-Host "`n[1/4] 파일 압축 중..." -ForegroundColor Yellow
cd $LOCAL
tar -czf gym_api.tar.gz --exclude=".git" --exclude="__pycache__" --exclude="*.pyc" --exclude=".venv" --exclude="venv" --exclude="*.sqlite3" .
Write-Host "✓ 압축 완료" -ForegroundColor Green

# 2. 업로드
Write-Host "`n[2/4] 파일 업로드 중..." -ForegroundColor Yellow
scp -i $KEY -o StrictHostKeyChecking=no gym_api.tar.gz ${SERVER}:/home/ubuntu/
Write-Host "✓ 업로드 완료" -ForegroundColor Green

# 3. 배포 - 단계별로 실행
Write-Host "`n[3/4] 서버 배포 중..." -ForegroundColor Yellow

# 압축 해제
Write-Host "  - 압축 해제..." -ForegroundColor Gray
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd gym_api && tar -xzf ~/gym_api.tar.gz"

# 의존성 설치
Write-Host "  - 의존성 설치..." -ForegroundColor Gray
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd gym_api && source venv/bin/activate && pip install -q -r requirements.txt"

# 마이그레이션
Write-Host "  - 마이그레이션..." -ForegroundColor Gray
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd gym_api && source venv/bin/activate && python manage.py makemigrations && python manage.py migrate"

# 정적 파일
Write-Host "  - 정적 파일..." -ForegroundColor Gray
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd gym_api && source venv/bin/activate && python manage.py collectstatic --noinput"

Write-Host "✓ 배포 완료" -ForegroundColor Green

# 4. 서버 재시작
Write-Host "`n[4/4] 서버 재시작 중..." -ForegroundColor Yellow
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "sudo systemctl restart gunicorn && sudo systemctl restart nginx"
Write-Host "✓ 서버 재시작 완료" -ForegroundColor Green

# 관리자 계정 생성
Write-Host "`n[보너스] 관리자 계정 생성 중..." -ForegroundColor Yellow
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER @"
cd gym_api
source venv/bin/activate
python manage.py shell <<EOF
from members.models import Member
email = 'admin@pumpy.com'
password = 'pumpy2025!'
try:
    admin = Member.objects.get(email=email)
    print('관리자 계정이 이미 존재합니다.')
except Member.DoesNotExist:
    admin = Member.objects.create(
        email=email,
        first_name='관리자',
        last_name='Pumpy',
        phone='010-0000-0000',
        is_staff=True,
        is_superuser=True,
        phone_verified=True,
        status='active'
    )
    admin.set_password(password)
    admin.save()
    print('관리자 계정 생성 완료!')
EOF
"@

# 정리
Remove-Item gym_api.tar.gz -Force

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ 배포 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📋 관리자 페이지:" -ForegroundColor Yellow
Write-Host "   URL: http://3.27.28.175/admin/" -ForegroundColor White
Write-Host "   Email: admin@pumpy.com" -ForegroundColor White
Write-Host "   Password: pumpy2025!" -ForegroundColor White

