#!/bin/bash

# AWS 웹 업데이트 스크립트

echo "🚀 AWS 웹 서버 업데이트 시작..."

# 1. 파일 업로드
echo "📤 파일 업로드 중..."

scp -r gym_web/app/app/info ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/
scp gym_web/app/app/page.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/
scp gym_web/app/app/community/page.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/community/
scp -r gym_web/app/app/community/profile ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/community/
scp gym_web/app/app/notifications/page.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/notifications/
scp gym_web/app/app/profile/page.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/profile/
scp gym_web/app/app/components/BottomNav.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/components/

# 2. 서버에서 빌드 및 재시작
echo "🔨 서버에서 빌드 중..."

ssh ubuntu@3.27.28.175 << 'EOF'
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 restart gym_web
pm2 save
EOF

echo "✅ AWS 웹 서버 업데이트 완료!"
echo "🌐 접속 URL: http://3.27.28.175:3000"










