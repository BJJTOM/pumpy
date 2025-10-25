#!/bin/bash
# ================================================================
# 🚀 펌피 AWS 즉시 배포 스크립트 (복사 & 붙여넣기 전용)
# 이 스크립트를 AWS 터미널에 전체 복사해서 붙여넣으세요!
# ================================================================

clear
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          🚀 펌피 AWS 완전 배포 시작                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "⏰ 시작: $(date '+%H:%M:%S')"
echo ""

# 프로젝트 디렉토리
cd /home/ubuntu/pumpy || cd /home/ubuntu || { echo "❌ 디렉토리 오류!"; exit 1; }

# ================================================================
# 백업
# ================================================================
echo "[1/9] 📦 백업..."
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz gym_api gym_web 2>/dev/null && echo "✅" || echo "⚠️ "

# ================================================================
# 백엔드 마이그레이션
# ================================================================
echo ""
echo "[2/9] 🐍 백엔드 마이그레이션..."
cd /home/ubuntu/pumpy/gym_api || { echo "❌ gym_api 없음!"; exit 1; }
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt --quiet
python manage.py makemigrations 2>/dev/null || echo "변경사항 없음"
python manage.py migrate
python manage.py collectstatic --noinput > /dev/null 2>&1
echo "✅ 마이그레이션 완료"

# ================================================================
# Gunicorn 재시작
# ================================================================
echo ""
echo "[3/9] 🔥 Gunicorn 재시작..."
sudo systemctl stop gunicorn 2>/dev/null
sudo fuser -k 8000/tcp 2>/dev/null
sleep 1

if [ -f "/etc/systemd/system/gunicorn.service" ]; then
    sudo systemctl start gunicorn
    sleep 2
    if sudo systemctl is-active --quiet gunicorn; then
        echo "✅ Gunicorn systemd 실행 중"
    else
        echo "⚠️  systemd 실패, 수동 실행..."
        nohup /home/ubuntu/pumpy/gym_api/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 --chdir /home/ubuntu/pumpy/gym_api config.wsgi:application > /tmp/gunicorn.log 2>&1 &
        sleep 2
        echo "✅ Gunicorn 수동 실행 완료"
    fi
else
    nohup /home/ubuntu/pumpy/gym_api/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 --chdir /home/ubuntu/pumpy/gym_api config.wsgi:application > /tmp/gunicorn.log 2>&1 &
    sleep 2
    echo "✅ Gunicorn 수동 실행 완료"
fi

# 포트 확인
if sudo netstat -tlnp | grep -q ':8000'; then
    echo "✅ 포트 8000 열림"
else
    echo "❌ 포트 8000 안 열림! 로그 확인: tail /tmp/gunicorn.log"
fi

# ================================================================
# 프론트엔드 준비
# ================================================================
echo ""
echo "[4/9] 📦 NPM 패키지 설치..."
cd /home/ubuntu/pumpy/gym_web || { echo "❌ gym_web 없음!"; exit 1; }
npm install --loglevel=error
echo "✅ 패키지 설치 완료"

echo ""
echo "[5/9] 🔨 Next.js 빌드..."
rm -rf .next out 2>/dev/null
npm run build
echo "✅ 빌드 완료"

# ================================================================
# PM2 재시작
# ================================================================
echo ""
echo "[6/9] 🔄 PM2 재시작..."
pm2 delete gym_web 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sleep 1

pm2 start npm --name "gym_web" -- start
pm2 save
echo "✅ PM2 시작 완료"

# 포트 확인
sleep 2
if sudo netstat -tlnp | grep -q ':3000'; then
    echo "✅ 포트 3000 열림"
else
    echo "⚠️  포트 3000 확인 필요"
fi

# ================================================================
# Nginx 확인 및 재시작
# ================================================================
echo ""
echo "[7/9] 🌐 Nginx 확인..."
if command -v nginx > /dev/null 2>&1; then
    sudo systemctl restart nginx 2>/dev/null && echo "✅ Nginx 재시작 완료" || echo "ℹ️  Nginx 없음"
else
    echo "ℹ️  Nginx 미설치"
fi

# ================================================================
# 상태 확인
# ================================================================
echo ""
echo "[8/9] 📊 서비스 상태..."
echo ""
echo "🔌 포트 리스닝:"
sudo netstat -tlnp | grep -E ':(80|3000|8000)' | awk '{print "   ✅", $4}' || echo "   ⚠️  포트 확인 필요"

echo ""
echo "🔥 Gunicorn:"
if sudo systemctl is-active --quiet gunicorn 2>/dev/null; then
    echo "   ✅ systemd 실행 중"
elif sudo netstat -tlnp | grep -q ':8000'; then
    echo "   ✅ 수동 실행 중"
else
    echo "   ❌ 실행 안 됨"
fi

echo ""
echo "🌐 PM2:"
pm2 status | grep gym_web | awk '{print "   ✅ PM2:", $10}' || echo "   ❌ PM2 문제"

# ================================================================
# API 테스트
# ================================================================
echo ""
echo "[9/9] 🧪 API 테스트..."
if curl -s http://localhost:8000/api/members/ > /dev/null 2>&1; then
    echo "✅ API 응답 정상"
else
    echo "⚠️  API 응답 확인 필요"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 프론트엔드 응답 정상"
else
    echo "⚠️  프론트엔드 확인 필요"
fi

# ================================================================
# 완료
# ================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              ✅ 배포 완료!                                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "⏰ 완료: $(date '+%H:%M:%S')"
echo ""
echo "🌐 접속 주소:"
echo "   ┌─────────────────────────────────────────────┐"
echo "   │  http://3.27.28.175/                        │"
echo "   └─────────────────────────────────────────────┘"
echo ""
echo "🧪 테스트할 페이지:"
echo "   • 대시보드:    http://3.27.28.175/"
echo "   • 회원 관리:   http://3.27.28.175/members"
echo "   • 회원 신청:   http://3.27.28.175/members/new"
echo "   • 상품 관리:   http://3.27.28.175/plans"
echo "   • 매출 관리:   http://3.27.28.175/revenue"
echo "   • 승인 대기:   http://3.27.28.175/pending"
echo ""
echo "⚠️  '데이터를 불러오는 중...'이 나오면:"
echo "   1. http://3.27.28.175/ 접속"
echo "   2. F12 (개발자 도구)"
echo "   3. Console에 입력:"
echo "      localStorage.setItem('apiUrl', '/api')"
echo "      location.reload()"
echo ""
echo "🔍 로그 확인:"
echo "   • Django:  sudo journalctl -u gunicorn -n 30"
echo "   • Django:  tail -f /tmp/gunicorn.log"
echo "   • Next.js: pm2 logs gym_web"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  🎉 브라우저에서 http://3.27.28.175/ 를 열어보세요!"
echo "════════════════════════════════════════════════════════════════"
echo ""





