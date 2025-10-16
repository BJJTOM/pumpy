#!/bin/bash
# AWS 전체 배포 스크립트 - Bash
# 로컬의 최신 변경사항을 AWS에 반영합니다

AWS_IP="3.27.28.175"
AWS_USER="ubuntu"
AWS_PATH="/home/ubuntu/pumpy"

echo "========================================"
echo "  🚀 AWS 서버 전체 업데이트 시작"
echo "========================================"
echo ""

# 1. 백엔드 파일 업로드
echo "[1/4] 백엔드 파일 업로드 중..."
scp -r gym_api/members ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_api/
scp gym_api/config/settings.py ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_api/config/
scp gym_api/config/urls.py ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_api/config/
scp gym_api/requirements.txt ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_api/

# 2. 프론트엔드 파일 업로드
echo "[2/4] 프론트엔드 파일 업로드 중..."
scp -r gym_web/app ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_web/
scp gym_web/lib/api.ts ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_web/lib/
scp gym_web/package.json ${AWS_USER}@${AWS_IP}:${AWS_PATH}/gym_web/

# 3. 백엔드 업데이트
echo "[3/4] 백엔드 서버 업데이트 중..."
ssh ${AWS_USER}@${AWS_IP} << 'EOF'
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
EOF

# 4. 프론트엔드 업데이트
echo "[4/4] 프론트엔드 서버 업데이트 중..."
ssh ${AWS_USER}@${AWS_IP} << 'EOF'
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 restart gym_web
pm2 save
EOF

echo ""
echo "========================================"
echo "  ✅ AWS 서버 업데이트 완료!"
echo "========================================"
echo ""
echo "🌐 접속 URL:"
echo "   웹: http://${AWS_IP}:3000"
echo "   API: http://${AWS_IP}:8000"
echo "   관리자: http://${AWS_IP}:8000/admin"
echo ""

