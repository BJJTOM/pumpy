#!/bin/bash

# Pumpy Django Admin 디자인 업데이트 스크립트
# AWS 서버에서 직접 실행

echo "🎨 Pumpy Django Admin 디자인 업데이트 시작..."

# 1. 프로젝트 디렉토리 찾기
echo "📁 프로젝트 디렉토리 찾는 중..."

PROJECT_DIR=""
POSSIBLE_PATHS=(
    "/home/ubuntu/gym_api"
    "/home/ubuntu/pumpy/gym_api"
    "/var/www/gym_api"
    "/opt/gym_api"
    "~/gym_api"
)

for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -f "$path/manage.py" ]; then
        PROJECT_DIR="$path"
        echo "✅ 프로젝트 발견: $PROJECT_DIR"
        break
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    echo "❌ 프로젝트를 찾을 수 없습니다. manage.py 위치를 확인해주세요."
    exit 1
fi

cd "$PROJECT_DIR"

# 2. Static 디렉토리 생성
echo "📁 Static 디렉토리 생성 중..."
mkdir -p members/static/admin/css
mkdir -p static/admin/css

# 3. Custom CSS 파일 생성
echo "🎨 Custom CSS 파일 생성 중..."
cat > members/static/admin/css/custom_admin.css << 'EOFCSS'
/* PUMPY ADMIN - CUSTOM STYLES */
:root {
    --primary-color: #667eea;
    --primary-dark: #5568d3;
    --primary-light: #7c94f5;
    --secondary-color: #764ba2;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Navbar - Gradient */
.main-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%) !important;
    border-bottom: none !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.main-header .navbar-nav .nav-link {
    color: rgba(255, 255, 255, 0.9) !important;
}

.main-header .navbar-nav .nav-link:hover {
    color: #ffffff !important;
}

/* Brand Logo */
.brand-link {
    background: rgba(0, 0, 0, 0.2) !important;
    color: #ffffff !important;
    font-weight: 700;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Sidebar - Dark */
.main-sidebar {
    background: #1e293b !important;
}

.sidebar-dark-primary .nav-sidebar > .nav-item > .nav-link.active {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light)) !important;
    box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
}

.sidebar-dark-primary .nav-sidebar > .nav-item > .nav-link:hover {
    background: rgba(255, 255, 255, 0.1) !important;
}

/* Cards */
.card {
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border: none;
    transition: all 0.3s ease;
}

.card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.card-header {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light)) !important;
    color: #ffffff !important;
    border-radius: 12px 12px 0 0 !important;
    font-weight: 600;
    border: none;
}

/* Small Box */
.small-box {
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.small-box:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
}

/* Info Box */
.info-box {
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.info-box:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

/* Buttons */
.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light)) !important;
    border: none !important;
    box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary-color)) !important;
    box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
}

/* Tables */
.table thead th {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light)) !important;
    color: #ffffff !important;
    border: none;
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.5px;
}

.table tbody tr {
    transition: all 0.3s ease;
}

.table tbody tr:hover {
    background: #f9fafb;
    transform: scale(1.005);
}

/* Login Page */
.login-page {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

.login-box {
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Animation */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card, .info-box, .small-box {
    animation: fadeIn 0.5s ease;
}
EOFCSS

echo "✅ Custom CSS 파일 생성 완료"

# 4. settings.py 백업
echo "💾 settings.py 백업 중..."
cp config/settings.py config/settings.py.backup

# 5. Static 파일 수집
echo "📦 Static 파일 수집 중..."
python3 manage.py collectstatic --noinput

# 6. 권한 설정
echo "🔒 파일 권한 설정 중..."
chmod 644 members/static/admin/css/custom_admin.css
chown -R www-data:www-data static/ 2>/dev/null || chown -R ubuntu:ubuntu static/

# 7. Gunicorn 재시작
echo "🔄 Gunicorn 재시작 중..."
sudo systemctl restart gunicorn

# 8. Nginx 재시작
echo "🔄 Nginx 재시작 중..."
sudo systemctl restart nginx

# 9. 상태 확인
echo ""
echo "✅ 서비스 상태:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo systemctl is-active gunicorn && echo "✅ Gunicorn: Running" || echo "❌ Gunicorn: Stopped"
sudo systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Stopped"

echo ""
echo "🎉 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "다음 단계:"
echo "1. 브라우저에서 http://3.27.28.175:8000/admin/ 접속"
echo "2. Ctrl+Shift+R (강력 새로고침)"
echo "3. 새로운 디자인 확인!"
echo ""
echo "📝 로그 확인:"
echo "sudo journalctl -u gunicorn -n 50"
echo "sudo tail -f /var/log/nginx/error.log"


