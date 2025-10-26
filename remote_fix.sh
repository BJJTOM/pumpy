#!/bin/bash
echo "펌피 서버 자동 수정 시작!"
sudo pkill -9 gunicorn 2>/dev/null
sleep 2
sudo systemctl daemon-reload
sudo systemctl restart gunicorn
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 delete pumpy-web 2>/dev/null
pm2 start npm --name "pumpy-web" -- start
pm2 save
sudo systemctl restart nginx
echo "✅ 완료!"
sudo systemctl status gunicorn --no-pager | head -5
pm2 status










