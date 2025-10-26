#!/bin/bash
# ================================================================
# 🚀 AWS 서버 배포 스크립트
# AWS 터미널에서 실행하세요!
# ================================================================

set -e  # 오류 발생 시 즉시 중단

echo "================================================================"
echo "  🚀 펌피(Pumpy) AWS 배포 시작"
echo "================================================================"
echo ""
echo "📍 현재 시간: $(date)"
echo "📍 작업 디렉토리: $(pwd)"
echo ""

# 프로젝트 디렉토리로 이동
cd /home/ubuntu/pumpy || { echo "❌ 프로젝트 디렉토리를 찾을 수 없습니다!"; exit 1; }

echo "[1/8] 📦 백업 생성 중..."
# 기존 파일 백업
if [ -d "gym_api" ]; then
    tar -czf "backup_$(date +%Y%m%d_%H%M%S).tar.gz" gym_api gym_web 2>/dev/null || echo "⚠️  백업 건너뜀"
fi
echo "    ✅ 백업 완료"

echo ""
echo "[2/8] 🐍 백엔드 업데이트 중..."
cd /home/ubuntu/pumpy/gym_api

# 가상환경 활성화
if [ ! -d "venv" ]; then
    echo "    📦 가상환경 생성 중..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "    ✅ 가상환경 활성화 완료"

echo ""
echo "[3/8] 📥 Python 패키지 설치 중..."
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo "    ✅ 패키지 설치 완료"

echo ""
echo "[4/8] 🗃️  데이터베이스 마이그레이션 중..."
python manage.py makemigrations
python manage.py migrate
echo "    ✅ 마이그레이션 완료"

echo ""
echo "[5/8] 📁 Static 파일 수집 중..."
python manage.py collectstatic --noinput
echo "    ✅ Static 파일 수집 완료"

echo ""
echo "[6/8] 🔄 Gunicorn 재시작 중..."
if sudo systemctl restart gunicorn 2>/dev/null; then
    echo "    ✅ Gunicorn 재시작 완료"
    sudo systemctl status gunicorn --no-pager -l
else
    echo "    ⚠️  Gunicorn 서비스 설정 필요"
    echo "    💡 수동으로 Django 서버를 실행하세요:"
    echo "       python manage.py runserver 0.0.0.0:8000"
fi

echo ""
echo "[7/8] 🌐 프론트엔드 빌드 중..."
cd /home/ubuntu/pumpy/gym_web

# Node 모듈 설치
echo "    📥 NPM 패키지 설치 중..."
npm install
echo "    ✅ NPM 패키지 설치 완료"

# Next.js 빌드
echo "    🔨 Next.js 빌드 중..."
npm run build
echo "    ✅ Next.js 빌드 완료"

echo ""
echo "[8/8] 🔄 PM2 재시작 중..."
if pm2 restart gym_web 2>/dev/null; then
    echo "    ✅ PM2 재시작 완료"
else
    echo "    📦 PM2로 새로 시작..."
    pm2 start npm --name "gym_web" -- start
fi

pm2 save
echo "    ✅ PM2 설정 저장 완료"

# PM2 상태 확인
echo ""
echo "📊 PM2 상태:"
pm2 status

echo ""
echo "================================================================"
echo "  ✅ 배포 완료!"
echo "================================================================"
echo ""
echo "🌐 접속 주소:"
echo "   ┌─────────────────────────────────────────────┐"
echo "   │  웹사이트:  http://3.27.28.175:3000        │"
echo "   │  API:       http://3.27.28.175:8000/api     │"
echo "   │  관리자:    http://3.27.28.175:8000/admin   │"
echo "   └─────────────────────────────────────────────┘"
echo ""
echo "🔍 서비스 상태 확인:"
echo "   • Gunicorn: sudo systemctl status gunicorn"
echo "   • PM2:      pm2 status"
echo "   • PM2 로그: pm2 logs gym_web"
echo ""
echo "🔧 문제 해결:"
echo "   • 백엔드 로그:   sudo journalctl -u gunicorn -f"
echo "   • 프론트엔드 로그: pm2 logs gym_web"
echo "   • 서비스 재시작: sudo systemctl restart gunicorn && pm2 restart gym_web"
echo ""
echo "📱 모바일 앱 설정:"
echo "   • 웹뷰 URL: http://3.27.28.175:3000"
echo "   • API URL:  http://3.27.28.175:8000/api"
echo ""
echo "================================================================"
echo "  🎉 배포가 완료되었습니다!"
echo "  지금 브라우저에서 http://3.27.28.175:3000 을 열어보세요!"
echo "================================================================"
echo ""








