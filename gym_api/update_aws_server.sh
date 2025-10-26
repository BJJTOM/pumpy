#!/bin/bash
# AWS 서버 업데이트 스크립트

echo "=========================================="
echo "AWS 서버 업데이트 시작"
echo "=========================================="

# 서버 정보
SERVER_IP="3.27.28.175"
SERVER_USER="ubuntu"
SERVER_PATH="/home/ubuntu/gym_api"

echo ""
echo "1. 마이그레이션 파일 적용"
echo "=========================================="

# SSH로 서버에 접속하여 마이그레이션 실행
ssh -i "your-key.pem" ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /home/ubuntu/gym_api
source venv/bin/activate

# 마이그레이션 생성 (이미 있으면 스킵됨)
python manage.py makemigrations

# 마이그레이션 적용
python manage.py migrate

# 서버 재시작
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ 마이그레이션 완료 및 서버 재시작 완료"
ENDSSH

echo ""
echo "=========================================="
echo "✅ AWS 서버 업데이트 완료!"
echo "=========================================="

