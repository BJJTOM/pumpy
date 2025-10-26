#!/bin/bash
# ================================================================
# 🔧 AWS CORS 문제 완전 해결 스크립트
# ================================================================

set -e

echo "================================================================"
echo "  🔧 AWS CORS 문제 해결 시작"
echo "================================================================"
echo ""

# 1. Django CORS 설정 업데이트
echo "[1/4] Django CORS 설정 업데이트 중..."
cd /home/ubuntu/pumpy/gym_api

# 백업
cp config/settings.py config/settings.py.backup.$(date +%Y%m%d_%H%M%S)

# AWS IP를 CORS 허용 목록에 추가
python3 << 'PYTHON_SCRIPT'
import re

with open('config/settings.py', 'r') as f:
    content = f.read()

# CORS_ALLOWED_ORIGINS 찾기
if 'CORS_ALLOWED_ORIGINS' in content:
    # 기존 설정에 추가
    pattern = r'(CORS_ALLOWED_ORIGINS\s*=\s*\[)(.*?)(\])'
    def add_origins(match):
        start, origins, end = match.groups()
        if '"http://3.27.28.175"' not in origins:
            new_origins = origins.rstrip(',') + ',\n    "http://3.27.28.175",\n    "http://3.27.28.175:3000",\n'
            return start + new_origins + end
        return match.group(0)
    content = re.sub(pattern, add_origins, content, flags=re.DOTALL)

with open('config/settings.py', 'w') as f:
    f.write(content)

print("✅ CORS 설정 업데이트 완료")
PYTHON_SCRIPT

echo "    ✅ Django 설정 업데이트 완료"

# 2. Gunicorn 재시작
echo ""
echo "[2/4] Gunicorn 재시작 중..."
sudo systemctl restart gunicorn
sleep 2

if sudo systemctl is-active --quiet gunicorn; then
    echo "    ✅ Gunicorn 재시작 성공"
else
    echo "    ⚠️  Gunicorn 재시작 실패, 로그 확인 필요"
    sudo journalctl -u gunicorn -n 10
fi

# 3. 프론트엔드 API URL 업데이트
echo ""
echo "[3/4] 프론트엔드 API URL 업데이트 중..."
cd /home/ubuntu/pumpy/gym_web

# 백업
cp lib/api.ts lib/api.ts.backup.$(date +%Y%m%d_%H%M%S)

# API URL을 상대 경로로 변경
cat > lib/api.ts << 'EOF'
// API 연결을 위한 유틸리티 함수
// 개발/프로덕션 환경에 따라 자동 전환

const LOCAL_API_URL = 'http://localhost:8000/api'
const AWS_API_URL = '/api'  // 상대 경로로 Nginx 프록시 사용

export const getApiUrl = (): string => {
  // 브라우저 환경에서만 localStorage 체크
  if (typeof window !== 'undefined') {
    // 사용자가 설정한 서버 URL이 있으면 사용
    const savedApiUrl = localStorage.getItem('apiUrl')
    if (savedApiUrl) {
      return savedApiUrl.replace(/\/$/, '')
    }
    
    // localhost로 접속한 경우 로컬 API 사용
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return LOCAL_API_URL
    }
  }
  
  // AWS 또는 기타 환경에서는 상대 경로 사용
  return AWS_API_URL
}

export const setApiUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apiUrl', url)
  }
}

export const resetApiUrl = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apiUrl')
  }
}

export const getFrontendUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000'
  }

  const savedServerUrl = localStorage.getItem('serverUrl')
  if (savedServerUrl) {
    return savedServerUrl.replace(/\/$/, '')
  }

  const hostname = window.location.hostname
  const port = window.location.port || '3000'
  const protocol = window.location.protocol
  
  return `${protocol}//${hostname}${port ? ':' + port : ''}`
}

// API 호출 헬퍼 함수
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const apiUrl = getApiUrl()
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Call Error:', error)
    throw error
  }
}
EOF

echo "    ✅ API URL 업데이트 완료"

# 4. 프론트엔드 재빌드 및 재시작
echo ""
echo "[4/4] 프론트엔드 재빌드 및 재시작 중..."
npm run build

pm2 restart gym_web
pm2 save

echo "    ✅ 프론트엔드 재시작 완료"

# 5. Nginx 설정 확인 및 업데이트
echo ""
echo "[추가] Nginx 프록시 설정 확인 중..."

if [ -f "/etc/nginx/sites-available/pumpy" ]; then
    echo "    ℹ️  Nginx 설정 파일 존재, 재시작..."
    sudo systemctl restart nginx
    echo "    ✅ Nginx 재시작 완료"
else
    echo "    ⚠️  Nginx 설정 파일 없음"
    echo "    💡 Nginx 설정이 필요한 경우 수동으로 설정하세요"
fi

echo ""
echo "================================================================"
echo "  ✅ CORS 문제 해결 완료!"
echo "================================================================"
echo ""
echo "🌐 접속 주소:"
echo "   http://3.27.28.175/"
echo ""
echo "🧪 테스트:"
echo "   1. 브라우저에서 http://3.27.28.175/ 접속"
echo "   2. F12 → Console → CORS 오류 확인 (없어야 함)"
echo "   3. 대시보드 데이터 로딩 확인"
echo ""
echo "🔍 문제가 있다면:"
echo "   • 브라우저 캐시 삭제 (Ctrl+Shift+Delete)"
echo "   • 시크릿 모드로 재접속"
echo "   • F12 → Console에서 오류 확인"
echo ""
echo "📞 로그 확인:"
echo "   • Django: sudo journalctl -u gunicorn -n 30"
echo "   • PM2: pm2 logs gym_web"
echo "   • Nginx: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "================================================================"








