#!/bin/bash
echo '=== AWS 서버 업데이트 시작 ==='
cd ~/gym
tar -xzf ~/gym_api_update.tar.gz --overwrite
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
sudo systemctl restart nginx
echo '=== 서비스 상태 ==='
sudo systemctl status gunicorn --no-pager | head -15
sudo systemctl status nginx --no-pager | head -10
echo '=== 최근 로그 ==='
sudo journalctl -u gunicorn -n 20 --no-pager
rm ~/gym_api_update.tar.gz
echo '✅ 배포 완료!'
