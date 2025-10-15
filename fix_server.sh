#!/bin/bash

echo "=========================================="
echo "  🔧 펌피 서버 자동 수정 스크립트"
echo "=========================================="
echo ""

# 1. 모든 서비스 상태 확인
echo "📊 [1/6] 현재 서비스 상태 확인 중..."
echo ""
sudo systemctl status gunicorn --no-pager | head -20
echo ""
sudo systemctl status nginx --no-pager | head -20
echo ""
pm2 status
echo ""

# 2. Gunicorn 재시작
echo "🔄 [2/6] Gunicorn (Django) 재시작 중..."
sudo pkill -9 gunicorn 2>/dev/null
sleep 2
sudo systemctl daemon-reload
sudo systemctl restart gunicorn
sudo systemctl status gunicorn --no-pager | head -10
echo ""

# 3. Next.js 재빌드 및 재시작
echo "🔄 [3/6] Next.js 프론트엔드 재빌드 중..."
cd /home/ubuntu/pumpy/gym_web
npm install --silent 2>&1 | tail -5
npm run build 2>&1 | tail -10
echo ""

echo "🔄 [4/6] PM2로 Next.js 재시작 중..."
pm2 delete pumpy-web 2>/dev/null
pm2 start npm --name "pumpy-web" -- start
pm2 save
pm2 status
echo ""

# 4. Nginx 재시작
echo "🔄 [5/6] Nginx 재시작 중..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -10
echo ""

# 5. 포트 확인
echo "🔍 [6/6] 포트 사용 확인..."
sudo netstat -tlnp | grep -E '80|8000|3000'
echo ""

# 6. 로컬 테스트
echo "🧪 로컬 연결 테스트..."
echo ""
echo "Django API 테스트:"
curl -s http://localhost:8000/api/members/ | head -c 200
echo ""
echo ""
echo "Nginx 테스트:"
curl -s http://localhost/ | head -c 200
echo ""
echo ""

echo "=========================================="
echo "  ✅ 수정 완료!"
echo "=========================================="
echo ""
echo "웹사이트: http://3.27.28.175/"
echo "API:      http://3.27.28.175/api/members/"
echo "관리자:   http://3.27.28.175/admin/"
echo ""
echo "브라우저를 새로고침(Ctrl+F5) 하세요!"
echo ""

