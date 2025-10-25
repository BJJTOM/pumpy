# 🚀 AWS 업데이트 명령어 (직접 실행용)
# AWS 서버에 SSH 접속 후 복사해서 붙여넣기!

cd /home/ubuntu/pumpy

# === 백엔드 업데이트 ===
echo "================================================"
echo "🔧 백엔드 업데이트 시작..."
echo "================================================"

cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

echo "🔄 Gunicorn 재시작 중..."
sudo systemctl restart gunicorn
sudo systemctl status gunicorn --no-pager

echo ""
echo "================================================"
echo "🌐 프론트엔드 업데이트 시작..."
echo "================================================"

cd /home/ubuntu/pumpy/gym_web
npm install
npm run build

echo "🔄 PM2 재시작 중..."
pm2 restart gym_web || pm2 start npm --name "gym_web" -- start
pm2 save
pm2 status

echo ""
echo "================================================"
echo "✅ 업데이트 완료!"
echo "================================================"
echo ""
echo "🌐 접속 주소:"
echo "   웹:      http://3.27.28.175:3000"
echo "   API:     http://3.27.28.175:8000/api"
echo "   관리자:  http://3.27.28.175:8000/admin"
echo ""
echo "🔍 상태 확인:"
echo "   백엔드:  sudo systemctl status gunicorn"
echo "   프론트:  pm2 status"
echo ""





