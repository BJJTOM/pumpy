#!/bin/bash
# AWS 서버에서 실행할 업데이트 스크립트

echo "========================================="
echo "  펌피 시스템 업데이트 시작"
echo "========================================="
echo ""

# 백엔드 업데이트
echo "[1/2] 백엔드 업데이트 중..."
cd /home/ubuntu/pumpy/gym_api

# 가상환경 활성화
source venv/bin/activate

# 의존성 설치
echo "  - 패키지 설치..."
pip install -r requirements.txt

# 데이터베이스 마이그레이션
echo "  - 데이터베이스 마이그레이션..."
python manage.py migrate

# 정적 파일 수집
echo "  - 정적 파일 수집..."
python manage.py collectstatic --noinput

# Gunicorn 재시작
echo "  - Gunicorn 재시작..."
sudo systemctl restart gunicorn

echo "  백엔드 업데이트 완료!"
echo ""

# 프론트엔드 업데이트
echo "[2/2] 프론트엔드 업데이트 중..."
cd /home/ubuntu/pumpy/gym_web

# 의존성 설치
echo "  - npm 패키지 설치..."
npm install

# 빌드
echo "  - Next.js 빌드..."
npm run build

# PM2 재시작
echo "  - PM2 재시작..."
pm2 restart gym_web
pm2 save

echo "  프론트엔드 업데이트 완료!"
echo ""

echo "========================================="
echo "  ✅ 업데이트 완료!"
echo "========================================="
echo ""
echo "접속 주소:"
echo "  웹: http://3.27.28.175:3000"
echo "  앱: http://3.27.28.175:3000/app"
echo ""
echo "서버 상태 확인:"
echo "  sudo systemctl status gunicorn"
echo "  pm2 status"
echo ""









