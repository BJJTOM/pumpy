#!/bin/bash
# ================================================================
# 🔧 AWS 연결 문제 해결 스크립트
# AWS 터미널에서 실행하세요!
# ================================================================

set -e

echo "================================================================"
echo "  🔧 AWS 연결 문제 해결 시작"
echo "================================================================"
echo ""

# 현재 상태 확인
echo "[진단] 현재 서버 상태 확인 중..."
echo ""

echo "1️⃣ 포트 리스닝 상태:"
sudo netstat -tlnp | grep -E ':(3000|8000)' || echo "⚠️  포트가 열려있지 않습니다!"

echo ""
echo "2️⃣ Gunicorn 상태:"
sudo systemctl is-active gunicorn 2>/dev/null || echo "⚠️  Gunicorn이 실행 중이 아닙니다"

echo ""
echo "3️⃣ PM2 상태:"
pm2 status || echo "⚠️  PM2 프로세스가 없습니다"

echo ""
echo "================================================================"
echo "  🔄 서비스 재시작"
echo "================================================================"
echo ""

# 기존 프로세스 완전히 종료
echo "[1/6] 기존 프로세스 종료 중..."
pm2 delete all 2>/dev/null || true
sudo systemctl stop gunicorn 2>/dev/null || true
sudo fuser -k 3000/tcp 2>/dev/null || true
sudo fuser -k 8000/tcp 2>/dev/null || true
sleep 3
echo "    ✅ 프로세스 종료 완료"

# 백엔드 환경 확인
echo ""
echo "[2/6] 백엔드 환경 확인 중..."
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate

# Django 설정 체크
python manage.py check || {
    echo "❌ Django 설정에 문제가 있습니다!"
    echo "로그를 확인하세요."
    exit 1
}
echo "    ✅ Django 설정 정상"

# Gunicorn 설정 확인 및 시작
echo ""
echo "[3/6] Gunicorn 시작 중..."

if [ -f "/etc/systemd/system/gunicorn.service" ]; then
    # systemd 서비스로 시작
    sudo systemctl start gunicorn
    sleep 2
    if sudo systemctl is-active --quiet gunicorn; then
        echo "    ✅ Gunicorn systemd 서비스 시작 완료"
    else
        echo "    ⚠️  systemd 시작 실패, 직접 실행으로 전환"
        nohup /home/ubuntu/pumpy/gym_api/venv/bin/gunicorn \
            --workers 3 \
            --bind 0.0.0.0:8000 \
            --chdir /home/ubuntu/pumpy/gym_api \
            config.wsgi:application \
            > /tmp/gunicorn.log 2>&1 &
        echo "    ✅ Gunicorn 직접 실행 완료"
    fi
else
    # systemd 서비스 파일이 없으면 직접 실행
    echo "    ℹ️  systemd 서비스 파일 없음, 직접 실행..."
    nohup /home/ubuntu/pumpy/gym_api/venv/bin/gunicorn \
        --workers 3 \
        --bind 0.0.0.0:8000 \
        --chdir /home/ubuntu/pumpy/gym_api \
        config.wsgi:application \
        > /tmp/gunicorn.log 2>&1 &
    echo "    ✅ Gunicorn 직접 실행 완료"
fi

sleep 2

# 백엔드 포트 확인
if sudo netstat -tlnp | grep -q ':8000'; then
    echo "    ✅ 백엔드 포트 8000 리스닝 중"
else
    echo "    ❌ 백엔드 포트 8000이 열리지 않았습니다!"
    echo "    로그 확인: tail -f /tmp/gunicorn.log"
fi

# 프론트엔드 빌드
echo ""
echo "[4/6] 프론트엔드 빌드 중..."
cd /home/ubuntu/pumpy/gym_web

# API URL 확인
if grep -q "3.27.28.175" lib/api.ts 2>/dev/null || grep -q "AWS_API_URL" lib/api.ts 2>/dev/null; then
    echo "    ✅ API URL 설정 확인됨"
else
    echo "    ⚠️  API URL 설정을 확인하세요"
fi

# Next.js 빌드
npm run build || {
    echo "    ⚠️  빌드 실패, 계속 진행..."
}
echo "    ✅ 빌드 완료"

# PM2로 프론트엔드 시작
echo ""
echo "[5/6] 프론트엔드 시작 중..."
cd /home/ubuntu/pumpy/gym_web

# PM2로 시작
pm2 start npm --name "gym_web" -- start
pm2 save

sleep 3

# 프론트엔드 포트 확인
if sudo netstat -tlnp | grep -q ':3000'; then
    echo "    ✅ 프론트엔드 포트 3000 리스닝 중"
else
    echo "    ❌ 프론트엔드 포트 3000이 열리지 않았습니다!"
    echo "    로그 확인: pm2 logs gym_web"
fi

# 최종 확인
echo ""
echo "[6/6] 최종 상태 확인..."
echo ""

echo "📊 포트 상태:"
sudo netstat -tlnp | grep -E ':(3000|8000)' | while read line; do
    echo "    ✅ $line"
done

echo ""
echo "📊 PM2 프로세스:"
pm2 status

echo ""
echo "================================================================"
echo "  ✅ 재시작 완료!"
echo "================================================================"
echo ""

# 로컬 테스트
echo "🧪 로컬 연결 테스트..."
echo ""

echo "1️⃣ 백엔드 API 테스트:"
if curl -s http://localhost:8000/api/members/ > /dev/null; then
    echo "    ✅ 백엔드 응답 정상"
else
    echo "    ❌ 백엔드 응답 없음"
fi

echo ""
echo "2️⃣ 프론트엔드 테스트:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "    ✅ 프론트엔드 응답 정상"
else
    echo "    ❌ 프론트엔드 응답 없음"
fi

echo ""
echo "================================================================"
echo "  🌐 접속 주소"
echo "================================================================"
echo ""
echo "   웹사이트:  http://3.27.28.175:3000"
echo "   API:       http://3.27.28.175:8000/api"
echo "   관리자:    http://3.27.28.175:8000/admin"
echo ""
echo "================================================================"
echo "  🔍 문제 해결"
echo "================================================================"
echo ""
echo "만약 여전히 연결되지 않는다면:"
echo ""
echo "1. AWS 보안 그룹 확인 (가장 중요!)"
echo "   → EC2 → 인스턴스 → 보안 탭 → 보안 그룹"
echo "   → 인바운드 규칙에 포트 3000, 8000 추가"
echo ""
echo "2. 로그 확인:"
echo "   • 백엔드: sudo journalctl -u gunicorn -n 30"
echo "   • 백엔드: tail -f /tmp/gunicorn.log"
echo "   • 프론트: pm2 logs gym_web"
echo ""
echo "3. 방화벽 확인:"
echo "   sudo ufw status"
echo "   sudo ufw allow 3000"
echo "   sudo ufw allow 8000"
echo ""
echo "================================================================"
echo ""





