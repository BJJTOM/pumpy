#!/bin/bash

# 펌피(Pumpy) AWS Lightsail 자동 배포 스크립트
# 이 스크립트를 Lightsail 서버에서 실행하세요

echo "=========================================="
echo "  🚀 펌피(Pumpy) AWS 배포 스크립트"
echo "=========================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1단계: 시스템 업데이트
echo -e "${YELLOW}[1/10]${NC} 시스템 업데이트 중..."
sudo apt update -qq
sudo apt upgrade -y -qq

# 2단계: 필수 패키지 설치
echo -e "${YELLOW}[2/10]${NC} 필수 패키지 설치 중..."
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx postgresql postgresql-contrib git

# 3단계: 프로젝트 디렉토리 생성
echo -e "${YELLOW}[3/10]${NC} 프로젝트 디렉토리 설정 중..."
cd /home/ubuntu
if [ ! -d "pumpy" ]; then
    mkdir pumpy
fi
cd pumpy

# 4단계: PostgreSQL 데이터베이스 설정
echo -e "${YELLOW}[4/10]${NC} 데이터베이스 설정 중..."
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'pumpy_db'" | grep -q 1 || \
sudo -u postgres psql <<EOF
CREATE DATABASE pumpy_db;
CREATE USER pumpy_user WITH PASSWORD 'PumpySecure2025!';
ALTER ROLE pumpy_user SET client_encoding TO 'utf8';
ALTER ROLE pumpy_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE pumpy_user SET timezone TO 'Asia/Seoul';
GRANT ALL PRIVILEGES ON DATABASE pumpy_db TO pumpy_user;
EOF

echo -e "${GREEN}✓${NC} 데이터베이스 생성 완료"

# 5단계: 백엔드 설정
echo -e "${YELLOW}[5/10]${NC} Django 백엔드 설정 중..."
cd /home/ubuntu/pumpy/gym_api

# 가상환경 생성
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# requirements.txt가 있으면 설치
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    # 필수 패키지 직접 설치
    pip install django djangorestframework django-cors-headers psycopg2-binary gunicorn whitenoise
fi

# Django 마이그레이션
export DJANGO_SETTINGS_MODULE=config.deploy_settings
export DB_PASSWORD="PumpySecure2025!"
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

echo -e "${GREEN}✓${NC} Django 백엔드 설정 완료"

# 6단계: Gunicorn 서비스 설정
echo -e "${YELLOW}[6/10]${NC} Gunicorn 서비스 설정 중..."
sudo tee /etc/systemd/system/gunicorn.service > /dev/null <<EOF
[Unit]
Description=Gunicorn daemon for Pumpy API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/pumpy/gym_api
Environment="PATH=/home/ubuntu/pumpy/gym_api/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=config.deploy_settings"
Environment="DB_PASSWORD=PumpySecure2025!"
ExecStart=/home/ubuntu/pumpy/gym_api/venv/bin/gunicorn \\
    --workers 3 \\
    --bind 0.0.0.0:8000 \\
    config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl restart gunicorn

echo -e "${GREEN}✓${NC} Gunicorn 서비스 시작 완료"

# 7단계: 프론트엔드 설정
echo -e "${YELLOW}[7/10]${NC} Next.js 프론트엔드 설정 중..."
cd /home/ubuntu/pumpy/gym_web

# Node.js 패키지 설치
npm install

# PM2 설치
sudo npm install -g pm2

# Next.js 빌드
npm run build

# PM2로 실행
pm2 delete pumpy-web 2>/dev/null || true
pm2 start npm --name "pumpy-web" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo -e "${GREEN}✓${NC} Next.js 프론트엔드 설정 완료"

# 8단계: Nginx 설정
echo -e "${YELLOW}[8/10]${NC} Nginx 웹서버 설정 중..."

# Lightsail IP 주소 자동 감지
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)

sudo tee /etc/nginx/sites-available/pumpy > /dev/null <<EOF
server {
    listen 80;
    server_name ${PUBLIC_IP} _;
    client_max_body_size 20M;

    # API (백엔드)
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Django Admin
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Static files
    location /static {
        alias /home/ubuntu/pumpy/gym_api/staticfiles;
    }

    # Media files
    location /media {
        alias /home/ubuntu/pumpy/gym_api/media;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Nginx 설정 활성화
sudo ln -sf /etc/nginx/sites-available/pumpy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo -e "${GREEN}✓${NC} Nginx 설정 완료"

# 9단계: 방화벽 설정 (UFW)
echo -e "${YELLOW}[9/10]${NC} 방화벽 설정 중..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
echo "y" | sudo ufw enable 2>/dev/null || true

echo -e "${GREEN}✓${NC} 방화벽 설정 완료"

# 10단계: 서비스 상태 확인
echo -e "${YELLOW}[10/10]${NC} 서비스 상태 확인 중..."
echo ""
echo "=========================================="
echo "  📊 서비스 상태"
echo "=========================================="
echo ""

# Gunicorn 상태
if systemctl is-active --quiet gunicorn; then
    echo -e "${GREEN}✓${NC} Gunicorn: 실행 중"
else
    echo -e "${RED}✗${NC} Gunicorn: 중지됨"
fi

# Nginx 상태
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx: 실행 중"
else
    echo -e "${RED}✗${NC} Nginx: 중지됨"
fi

# PostgreSQL 상태
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓${NC} PostgreSQL: 실행 중"
else
    echo -e "${RED}✗${NC} PostgreSQL: 중지됨"
fi

# PM2 상태
if pm2 list | grep -q "pumpy-web"; then
    echo -e "${GREEN}✓${NC} Next.js (PM2): 실행 중"
else
    echo -e "${RED}✗${NC} Next.js (PM2): 중지됨"
fi

echo ""
echo "=========================================="
echo "  🎉 배포 완료!"
echo "=========================================="
echo ""
echo -e "${GREEN}웹사이트:${NC} http://${PUBLIC_IP}/"
echo -e "${GREEN}API:${NC}      http://${PUBLIC_IP}/api/"
echo -e "${GREEN}관리자:${NC}   http://${PUBLIC_IP}/admin/"
echo ""
echo "=========================================="
echo "  📝 다음 단계"
echo "=========================================="
echo ""
echo "1. Django 관리자 계정 생성:"
echo "   cd /home/ubuntu/pumpy/gym_api"
echo "   source venv/bin/activate"
echo "   python manage.py createsuperuser"
echo ""
echo "2. Lightsail 콘솔에서 방화벽 포트 열기:"
echo "   - HTTP (80)"
echo "   - HTTPS (443)"
echo ""
echo "3. 고정 IP 할당 (선택사항)"
echo ""
echo "4. 앱 API URL 변경:"
echo "   http://${PUBLIC_IP}/api"
echo ""
echo "=========================================="
echo ""

# 접속 정보 파일 생성
cat > /home/ubuntu/pumpy/접속정보.txt <<EOF
========================================
  펌피(Pumpy) 서버 접속 정보
========================================

공개 IP 주소: ${PUBLIC_IP}

웹사이트: http://${PUBLIC_IP}/
API:      http://${PUBLIC_IP}/api/
관리자:   http://${PUBLIC_IP}/admin/

데이터베이스:
- 이름: pumpy_db
- 사용자: pumpy_user
- 비밀번호: PumpySecure2025!

SSH 접속:
ssh ubuntu@${PUBLIC_IP}

서비스 관리:
- Django: sudo systemctl status gunicorn
- Nginx: sudo systemctl status nginx
- PostgreSQL: sudo systemctl status postgresql
- Next.js: pm2 status

로그 확인:
- Django: sudo journalctl -u gunicorn -f
- Nginx: sudo tail -f /var/log/nginx/error.log
- Next.js: pm2 logs pumpy-web

배포 일시: $(date)
========================================
EOF

echo -e "${GREEN}접속 정보가 저장되었습니다:${NC} /home/ubuntu/pumpy/접속정보.txt"
echo ""


