#!/bin/bash
# AWS 서버에 백엔드 API 업데이트 배포

echo "========================================="
echo "AWS 서버 백엔드 API 업데이트 배포"
echo "========================================="

# 서버 정보
SERVER="ubuntu@3.27.28.175"
APP_DIR="/home/ubuntu/gym_api"

echo "📦 1. 백엔드 파일 압축 중..."
cd gym_api
tar -czf ../gym_api_update.tar.gz members/community_views.py members/community_serializers.py
cd ..

echo ""
echo "🚀 2. 서버로 파일 전송 중..."
scp -i "your-key.pem" gym_api_update.tar.gz $SERVER:~/

echo ""
echo "🔧 3. 서버에서 파일 압축 해제 및 적용..."
ssh -i "your-key.pem" $SERVER << 'EOF'
cd /home/ubuntu/gym_api
tar -xzf ../gym_api_update.tar.gz
sudo systemctl restart gunicorn
sudo systemctl restart nginx
echo "✅ 배포 완료!"
EOF

echo ""
echo "========================================="
echo "✅ 백엔드 API 업데이트 완료!"
echo "========================================="

