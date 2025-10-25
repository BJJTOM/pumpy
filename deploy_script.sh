#!/bin/bash
set -e

echo "?? 諛고룷 ?쒖옉..."

# ?꾨줈?앺듃濡??대룞 ?먮뒗 ?대줎
cd ~/pumpy 2>/dev/null || (cd ~ && git clone https://github.com/BJJTOM/pumpy.git && cd pumpy)

# 理쒖떊 肄붾뱶 媛?몄삤湲?
git fetch origin
git reset --hard origin/main
git pull origin main

echo "??肄붾뱶 ?낅뜲?댄듃 ?꾨즺"

# Django 諛깆뿏??
echo "?릫 Django 諛고룷 以?.."
cd gym_api
source venv/bin/activate 2>/dev/null || (python3 -m venv venv && source venv/bin/activate)
pip install -q -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
sudo systemctl status gunicorn --no-pager | head -n 3

echo "??Django ?꾨즺"

# Next.js ?꾨줎?몄뿏??(理쒖쟻??
echo "?쏉툘  Next.js 諛고룷 以?.."
cd ../gym_web

# node_modules 罹먯떆 ?쒖슜
if [ -d "node_modules" ]; then
    echo "?벀 湲곗〈 ?⑦궎吏 ?ъ슜 (鍮좊Ⅸ ?ㅼ튂)"
    npm install --prefer-offline --no-audit
else
    echo "?벀 ?⑦궎吏 ?ㅼ튂 以?.."
    npm install --no-audit
fi

# 鍮뚮뱶 理쒖쟻??
echo "?룛截? 鍮뚮뱶 以?(5-10遺?..."
export NODE_OPTIONS="--max-old-space-size=3072"
export NEXT_TELEMETRY_DISABLED=1

# 湲곗〈 鍮뚮뱶 ??젣
rm -rf .next

# 鍮뚮뱶 ?ㅽ뻾
npm run build 2>&1 | grep -E "(Compiled|error|warn)" || true

echo "??Next.js 鍮뚮뱶 ?꾨즺"

# PM2濡??ㅽ뻾
pm2 delete gym-web 2>/dev/null || true
pm2 start npm --name "gym-web" -- start
pm2 save
pm2 status

echo "??PM2 ?쒖옉 ?꾨즺"

# Nginx ?ъ떆??
echo "?뙋 Nginx ?ъ떆??.."
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager | head -n 3

# ?뚯뒪??
echo ""
echo "?㎦ API ?뚯뒪??.."
curl -s http://localhost:8000/api/members/ | head -n 3 || echo "API ?묐떟 ?湲?以?.."

echo ""
echo "========================================"
echo "?럦 諛고룷 ?꾨즺!"
echo "========================================"
echo "?묒냽: http://3.27.28.175"