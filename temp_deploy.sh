cd ~/pumpy 2>/dev/null || (cd ~ && git clone https://github.com/BJJTOM/pumpy.git && cd pumpy)
git pull origin main
cd gym_api
source venv/bin/activate 2>/dev/null || (python3 -m venv venv && source venv/bin/activate)
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
cd ../gym_web
npm install
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
pm2 delete gym-web 2>/dev/null || true
pm2 start npm --name "gym-web" -- start
pm2 save
sudo systemctl restart nginx
echo "??諛고룷 ?꾨즺!"
