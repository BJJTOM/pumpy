#!/bin/bash

# 🎯 AWS 서버에서 직접 실행할 배포 명령어
# 3.27.28.175 서버에 접속해서 이 명령어들을 복사해서 실행하세요!

echo "========================================"
echo "🚀 Pumpy 완전 배포 시작!"
echo "========================================"

# 1. 프로젝트 디렉토리로 이동
cd /home/ubuntu/pumpy || cd ~/pumpy || {
    echo "❌ pumpy 디렉토리가 없습니다. GitHub에서 클론합니다..."
    cd ~
    git clone https://github.com/BJJTOM/pumpy.git
    cd pumpy
}

echo "✅ 현재 위치: $(pwd)"

# 2. 최신 코드 가져오기
echo ""
echo "📥 최신 코드 가져오기..."
git fetch origin
git pull origin main

# 3. Django 백엔드 배포
echo ""
echo "========================================"
echo "🐍 Django 백엔드 배포"
echo "========================================"

cd gym_api

# 가상환경 활성화/생성
if [ -d "venv" ]; then
    source venv/bin/activate
else
    python3 -m venv venv
    source venv/bin/activate
fi

# 패키지 설치
echo "📦 패키지 설치 중..."
pip install -r requirements.txt

# 마이그레이션
echo "🗄️  마이그레이션 실행 중..."
python manage.py makemigrations
python manage.py migrate

# Static 파일 수집
echo "📁 Static 파일 수집 중..."
python manage.py collectstatic --noinput

# Gunicorn 재시작
echo "🔄 Gunicorn 재시작 중..."
sudo systemctl restart gunicorn
sudo systemctl status gunicorn --no-pager | head -n 5

# 4. Next.js 프론트엔드 배포
echo ""
echo "========================================"
echo "⚛️  Next.js 프론트엔드 배포"
echo "========================================"

cd ../gym_web

# 노드 모듈 설치
echo "📦 Node.js 패키지 설치 중..."
npm install

# Next.js 빌드
echo "🏗️  Next.js 빌드 중 (5-10분 소요)..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# PM2 재시작
echo "🔄 PM2 재시작 중..."
pm2 delete gym-web 2>/dev/null || true
pm2 start npm --name "gym-web" -- start
pm2 save
pm2 status

# 5. Nginx 재시작
echo ""
echo "🌐 Nginx 재시작 중..."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -n 5

# 6. 최종 확인
echo ""
echo "========================================"
echo "🎉 배포 완료!"
echo "========================================"
echo ""
echo "📱 접속 URL:"
echo "  - 웹사이트: http://3.27.28.175"
echo "  - 관리자: http://3.27.28.175/admin"
echo "  - 회원 앱: http://3.27.28.175/app"
echo "  - API: http://3.27.28.175/api"
echo ""
echo "🧪 API 테스트 중..."
curl -s http://localhost:8000/api/members/ | head -n 5
echo ""
echo "✅ 배포 성공!"


