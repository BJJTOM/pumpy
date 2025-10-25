#!/bin/bash

# 🚀 Pumpy 완전 자동 배포 스크립트
# 작성일: 2025-10-25
# AWS EC2 서버에서 실행하세요

set -e  # 에러 발생 시 중단

echo "========================================"
echo "🚀 Pumpy AWS 배포 시작"
echo "========================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 프로젝트 디렉토리로 이동
echo -e "${YELLOW}📁 프로젝트 디렉토리로 이동...${NC}"
cd /home/ubuntu/pumpy || cd ~/pumpy || {
    echo -e "${RED}❌ 프로젝트 디렉토리를 찾을 수 없습니다!${NC}"
    echo "💡 GitHub에서 클론하시겠습니까? (y/n)"
    read -r answer
    if [ "$answer" = "y" ]; then
        cd ~
        git clone https://github.com/BJJTOM/pumpy.git
        cd pumpy
    else
        exit 1
    fi
}

echo -e "${GREEN}✅ 프로젝트 디렉토리: $(pwd)${NC}"

# 2. 최신 코드 가져오기
echo -e "${YELLOW}📥 GitHub에서 최신 코드 가져오기...${NC}"
git fetch origin
git pull origin main

# 3. Django 백엔드 배포
echo ""
echo "========================================"
echo "🐍 Django 백엔드 배포"
echo "========================================"

cd gym_api

# 가상환경 활성화
if [ -d "venv" ]; then
    echo -e "${YELLOW}🔄 가상환경 활성화...${NC}"
    source venv/bin/activate
else
    echo -e "${YELLOW}📦 가상환경 생성...${NC}"
    python3 -m venv venv
    source venv/bin/activate
fi

# 패키지 설치
echo -e "${YELLOW}📦 Python 패키지 설치...${NC}"
pip install -r requirements.txt

# 마이그레이션
echo -e "${YELLOW}🗄️  데이터베이스 마이그레이션...${NC}"
python manage.py makemigrations
python manage.py migrate

# Static 파일 수집
echo -e "${YELLOW}📁 Static 파일 수집...${NC}"
python manage.py collectstatic --noinput

# Gunicorn 재시작
echo -e "${YELLOW}🔄 Gunicorn 재시작...${NC}"
sudo systemctl restart gunicorn

echo -e "${GREEN}✅ Django 백엔드 배포 완료!${NC}"

# 4. Next.js 프론트엔드 배포
echo ""
echo "========================================"
echo "⚛️  Next.js 프론트엔드 배포"
echo "========================================"

cd ../gym_web

# 노드 모듈 설치
echo -e "${YELLOW}📦 Node.js 패키지 설치...${NC}"
npm install

# Next.js 빌드
echo -e "${YELLOW}🏗️  Next.js 빌드 중... (시간이 걸릴 수 있습니다)${NC}"
npm run build

# PM2 재시작
echo -e "${YELLOW}🔄 PM2 재시작...${NC}"
pm2 restart gym-web || pm2 start npm --name "gym-web" -- start

echo -e "${GREEN}✅ Next.js 프론트엔드 배포 완료!${NC}"

# 5. Nginx 재시작
echo ""
echo "========================================"
echo "🌐 Nginx 재시작"
echo "========================================"

sudo systemctl restart nginx

echo -e "${GREEN}✅ Nginx 재시작 완료!${NC}"

# 6. 상태 확인
echo ""
echo "========================================"
echo "📊 서비스 상태 확인"
echo "========================================"

echo -e "${YELLOW}Django (Gunicorn):${NC}"
sudo systemctl status gunicorn --no-pager | head -n 3

echo ""
echo -e "${YELLOW}Next.js (PM2):${NC}"
pm2 status

echo ""
echo -e "${YELLOW}Nginx:${NC}"
sudo systemctl status nginx --no-pager | head -n 3

# 7. API 테스트
echo ""
echo "========================================"
echo "🧪 API 테스트"
echo "========================================"

API_URL="http://localhost:8000/api/members/"
echo -e "${YELLOW}테스트 URL: $API_URL${NC}"

if curl -s -o /dev/null -w "%{http_code}" $API_URL | grep -q "200"; then
    echo -e "${GREEN}✅ API 정상 작동!${NC}"
else
    echo -e "${RED}⚠️  API 응답 확인 필요${NC}"
fi

# 완료
echo ""
echo "========================================"
echo "🎉 배포 완료!"
echo "========================================"
echo ""
echo "📱 접속 URL:"
echo "  - 웹사이트: http://$(curl -s ifconfig.me)"
echo "  - API: http://$(curl -s ifconfig.me)/api/"
echo "  - 관리자: http://$(curl -s ifconfig.me)/admin"
echo ""
echo "💡 문제가 발생하면 다음 명령어로 로그를 확인하세요:"
echo "  - Django 로그: sudo journalctl -u gunicorn -f"
echo "  - Next.js 로그: pm2 logs gym-web"
echo "  - Nginx 로그: sudo tail -f /var/log/nginx/error.log"
echo ""


