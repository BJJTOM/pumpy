#!/bin/bash

# AWS Django Admin 디자인 수정 스크립트

echo "🎨 Pumpy Django Admin 디자인 업데이트 시작..."

# 프로젝트 디렉토리로 이동 (실제 경로로 수정 필요)
cd ~/gym_api || cd /home/ubuntu/gym_api || cd /var/www/gym_api

echo "📁 현재 디렉토리: $(pwd)"

# Git pull (GitHub 사용 시)
echo "📥 최신 코드 가져오기..."
git pull origin main

# Static 파일 수집
echo "📦 Static 파일 수집 중..."
python3 manage.py collectstatic --noinput

# 서버 재시작
echo "🔄 Gunicorn 재시작..."
sudo systemctl restart gunicorn

echo "🔄 Nginx 재시작..."
sudo systemctl restart nginx

# 상태 확인
echo "✅ 서비스 상태 확인..."
sudo systemctl status gunicorn --no-pager | head -5
sudo systemctl status nginx --no-pager | head -5

echo ""
echo "🎉 완료!"
echo "브라우저에서 http://3.27.28.175:8000/admin/ 접속 후"
echo "Ctrl+Shift+R 로 강력 새로고침 하세요!"


