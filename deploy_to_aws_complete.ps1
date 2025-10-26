# AWS 서버 완전 배포 스크립트
# pumpy-key.pem을 사용하여 자동 배포

$KEY_PATH = "C:\Users\guddn\Downloads\COCO\pumpy-key.pem"
$SERVER_IP = "3.27.28.175"
$SERVER_USER = "ubuntu"
$LOCAL_PATH = "C:\Users\guddn\Downloads\COCO\gym_api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS 서버 완전 배포 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. SSH 키 권한 설정
Write-Host "`n[1/6] SSH 키 권한 설정..." -ForegroundColor Yellow
if (Test-Path $KEY_PATH) {
    Write-Host "✓ SSH 키 발견: $KEY_PATH" -ForegroundColor Green
} else {
    Write-Host "✗ SSH 키를 찾을 수 없습니다!" -ForegroundColor Red
    exit 1
}

# 2. 로컬 파일 압축
Write-Host "`n[2/6] 로컬 파일 압축 중..." -ForegroundColor Yellow
cd $LOCAL_PATH
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$ARCHIVE_NAME = "gym_api_$TIMESTAMP.tar.gz"

# tar를 사용하여 압축 (Windows 10+에서 기본 제공)
tar -czf $ARCHIVE_NAME `
    --exclude=".git" `
    --exclude="__pycache__" `
    --exclude="*.pyc" `
    --exclude=".venv" `
    --exclude="venv" `
    --exclude="*.sqlite3" `
    --exclude="node_modules" `
    .

if (Test-Path $ARCHIVE_NAME) {
    Write-Host "✓ 압축 완료: $ARCHIVE_NAME" -ForegroundColor Green
} else {
    Write-Host "✗ 압축 실패!" -ForegroundColor Red
    exit 1
}

# 3. 서버로 파일 업로드
Write-Host "`n[3/6] 서버로 파일 업로드 중..." -ForegroundColor Yellow
scp -i $KEY_PATH -o StrictHostKeyChecking=no $ARCHIVE_NAME ${SERVER_USER}@${SERVER_IP}:/home/ubuntu/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 업로드 완료!" -ForegroundColor Green
} else {
    Write-Host "✗ 업로드 실패!" -ForegroundColor Red
    exit 1
}

# 4. 서버에서 백업 및 배포
Write-Host "`n[4/6] 서버에서 배포 중..." -ForegroundColor Yellow

$SSH_COMMANDS = @"
#!/bin/bash
set -e

echo '=========================================='
echo '서버 배포 시작'
echo '=========================================='

# 백업
echo '[1/5] 기존 파일 백업 중...'
cd /home/ubuntu
if [ -d gym_api ]; then
    BACKUP_NAME=gym_api_backup_\$(date +%Y%m%d_%H%M%S).tar.gz
    tar -czf \$BACKUP_NAME gym_api/
    echo '✓ 백업 완료: \$BACKUP_NAME'
fi

# 압축 해제
echo '[2/5] 새 파일 압축 해제 중...'
cd gym_api
tar -xzf ../$ARCHIVE_NAME
echo '✓ 압축 해제 완료'

# 가상환경 활성화 및 의존성 설치
echo '[3/5] 의존성 확인 중...'
source venv/bin/activate
pip install -q -r requirements.txt
echo '✓ 의존성 확인 완료'

# 마이그레이션
echo '[4/5] 마이그레이션 적용 중...'
python manage.py makemigrations
python manage.py migrate
echo '✓ 마이그레이션 완료'

# 정적 파일 수집
echo '[5/5] 정적 파일 수집 중...'
python manage.py collectstatic --noinput
echo '✓ 정적 파일 수집 완료'

echo ''
echo '=========================================='
echo '✓ 배포 완료!'
echo '=========================================='
"@

ssh -i $KEY_PATH -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} $SSH_COMMANDS

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 배포 완료!" -ForegroundColor Green
} else {
    Write-Host "✗ 배포 실패!" -ForegroundColor Red
    exit 1
}

# 5. 서버 재시작
Write-Host "`n[5/6] 서버 재시작 중..." -ForegroundColor Yellow
ssh -i $KEY_PATH -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "sudo systemctl restart gunicorn; sudo systemctl restart nginx"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 서버 재시작 완료!" -ForegroundColor Green
} else {
    Write-Host "⚠ 서버 재시작 실패 (수동 재시작 필요)" -ForegroundColor Yellow
}

# 6. 슈퍼유저 생성
Write-Host "`n[6/6] 관리자 계정 생성 중..." -ForegroundColor Yellow

$CREATE_SUPERUSER = @"
#!/bin/bash
cd /home/ubuntu/gym_api
source venv/bin/activate

python manage.py shell << EOF
from django.contrib.auth import get_user_model
from members.models import Member

User = get_user_model()

# Member 모델을 User로 사용하는 경우
email = 'admin@pumpy.com'
password = 'pumpy2025!'

try:
    admin = Member.objects.get(email=email)
    print(f'✓ 관리자 계정이 이미 존재합니다: {email}')
except Member.DoesNotExist:
    admin = Member.objects.create(
        email=email,
        first_name='관리자',
        last_name='Pumpy',
        phone='010-0000-0000',
        is_staff=True,
        is_superuser=True,
        phone_verified=True,
        email_verified=True,
        status='active',
        is_approved=True
    )
    admin.set_password(password)
    admin.save()
    print(f'✓ 관리자 계정 생성 완료!')
    print(f'   Email: {email}')
    print(f'   Password: {password}')
    
print('')
print('========================================')
print('관리자 페이지 접속 정보')
print('========================================')
print(f'URL: http://3.27.28.175/admin/')
print(f'Email: {email}')
print(f'Password: {password}')
print('========================================')
EOF
"@

ssh -i $KEY_PATH -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} $CREATE_SUPERUSER

# 로컬 압축 파일 정리
Write-Host "`n[정리] 임시 파일 삭제 중..." -ForegroundColor Yellow
Remove-Item $ARCHIVE_NAME -Force
Write-Host "✓ 정리 완료!" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ 모든 배포 작업 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📋 관리자 페이지 접속 정보:" -ForegroundColor Yellow
Write-Host "   URL: http://3.27.28.175/admin/" -ForegroundColor White
Write-Host "   Email: admin@pumpy.com" -ForegroundColor White
Write-Host "   Password: pumpy2025!" -ForegroundColor White

Write-Host "`n🔍 서버 상태 확인:" -ForegroundColor Yellow
Write-Host "   API: http://3.27.28.175/api/" -ForegroundColor White
Write-Host "   공지사항: http://3.27.28.175/api/notices/" -ForegroundColor White
Write-Host "   배너: http://3.27.28.175/api/banners/" -ForegroundColor White
Write-Host "   게시글: http://3.27.28.175/api/posts/" -ForegroundColor White

Write-Host "`n✨ 앱을 재시작하여 변경사항을 확인하세요!" -ForegroundColor Cyan

