# AWS 서버 배포 (pumpy/gym_api 경로)

$KEY = "C:\Users\guddn\Downloads\COCO\pumpy-key.pem"
$SERVER = "ubuntu@3.27.28.175"
$LOCAL = "C:\Users\guddn\Downloads\COCO\gym_api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS 서버 배포 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 압축
Write-Host "`n[1/5] 파일 압축 중..." -ForegroundColor Yellow
cd $LOCAL
tar -czf gym_api.tar.gz --exclude=".git" --exclude="__pycache__" --exclude="*.pyc" --exclude=".venv" --exclude="venv" --exclude="*.sqlite3" .
Write-Host "✓ 압축 완료" -ForegroundColor Green

# 2. 업로드
Write-Host "`n[2/5] 파일 업로드 중..." -ForegroundColor Yellow
scp -i $KEY -o StrictHostKeyChecking=no gym_api.tar.gz ${SERVER}:~/
Write-Host "✓ 업로드 완료" -ForegroundColor Green

# 3. 배포
Write-Host "`n[3/5] 서버 배포 중..." -ForegroundColor Yellow
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd pumpy/gym_api && tar -xzf ~/gym_api.tar.gz && echo '압축 해제 완료'"
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd pumpy/gym_api && source venv/bin/activate && pip install -q -r requirements.txt && echo '의존성 설치 완료'"
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd pumpy/gym_api && source venv/bin/activate && python manage.py makemigrations && python manage.py migrate && echo '마이그레이션 완료'"
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd pumpy/gym_api && source venv/bin/activate && python manage.py collectstatic --noinput && echo '정적 파일 수집 완료'"
Write-Host "✓ 배포 완료" -ForegroundColor Green

# 4. 서버 재시작
Write-Host "`n[4/5] 서버 재시작 중..." -ForegroundColor Yellow
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "sudo systemctl restart gunicorn && sudo systemctl restart nginx"
Write-Host "✓ 서버 재시작 완료" -ForegroundColor Green

# 5. 관리자 계정 생성
Write-Host "`n[5/5] 관리자 계정 생성 중..." -ForegroundColor Yellow
$CREATE_ADMIN = @'
cd pumpy/gym_api
source venv/bin/activate
python manage.py shell <<PYEOF
from members.models import Member
email = 'admin@pumpy.com'
password = 'pumpy2025!'
try:
    admin = Member.objects.get(email=email)
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    print('✓ 관리자 계정 업데이트 완료')
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
    print('✓ 관리자 계정 생성 완료')
PYEOF
'@

ssh -i $KEY -o StrictHostKeyChecking=no $SERVER $CREATE_ADMIN
Write-Host "✓ 관리자 계정 준비 완료" -ForegroundColor Green

# 정리
Remove-Item gym_api.tar.gz -Force

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ 배포 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📋 관리자 페이지 접속 정보:" -ForegroundColor Yellow
Write-Host "   URL: http://3.27.28.175/admin/" -ForegroundColor Cyan
Write-Host "   Email: admin@pumpy.com" -ForegroundColor White
Write-Host "   Password: pumpy2025!" -ForegroundColor White

Write-Host "`n🔍 API 테스트:" -ForegroundColor Yellow
Write-Host "   게시글: http://3.27.28.175/api/posts/" -ForegroundColor White
Write-Host "   댓글: http://3.27.28.175/api/comments/" -ForegroundColor White
Write-Host "   공지사항: http://3.27.28.175/api/notices/" -ForegroundColor White
Write-Host "   배너: http://3.27.28.175/api/banners/" -ForegroundColor White

Write-Host "`n✨ 앱을 재시작하여 변경사항을 확인하세요!" -ForegroundColor Cyan

