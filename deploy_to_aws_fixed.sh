#!/bin/bash

# AWS 서버 주소
AWS_HOST="ubuntu@3.27.28.175"
AWS_KEY="C:/Users/guddn/Downloads/labsuser.pem"

echo "🚀 AWS 서버로 배포 시작..."

# 1. gym_api 디렉토리 압축
echo "📦 1단계: 파일 압축 중..."
cd gym_api
tar -czf ../gym_api_update.tar.gz \
  config/ \
  members/ \
  manage.py \
  requirements.txt \
  db.sqlite3 \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='venv' \
  --exclude='node_modules'

cd ..

# 2. 서버로 전송
echo "📤 2단계: 서버로 파일 전송 중..."
scp -i "$AWS_KEY" gym_api_update.tar.gz $AWS_HOST:~/

# 3. 서버에서 압축 해제 및 재시작
echo "🔄 3단계: 서버에서 업데이트 적용 중..."
ssh -i "$AWS_KEY" $AWS_HOST << 'EOF'
  # 압축 해제
  cd ~/gym
  tar -xzf ~/gym_api_update.tar.gz --overwrite
  
  # 가상환경 활성화
  source venv/bin/activate
  
  # 마이그레이션 (있을 경우)
  python manage.py makemigrations
  python manage.py migrate
  
  # 정적 파일 수집
  python manage.py collectstatic --noinput
  
  # Gunicorn 재시작
  sudo systemctl restart gunicorn
  sudo systemctl restart nginx
  
  # 상태 확인
  echo "✅ 서비스 상태:"
  sudo systemctl status gunicorn --no-pager -l 0
  
  # 로그 확인 (최근 10줄)
  echo ""
  echo "📋 최근 로그:"
  sudo journalctl -u gunicorn -n 10 --no-pager
  
  # 정리
  rm ~/gym_api_update.tar.gz
EOF

# 4. 로컬 임시 파일 정리
echo "🧹 4단계: 로컬 임시 파일 정리..."
rm gym_api_update.tar.gz

echo ""
echo "✅ 배포 완료!"
echo "🌐 서버 주소: http://3.27.28.175"
echo "🔍 확인: http://3.27.28.175/api/"
echo ""


