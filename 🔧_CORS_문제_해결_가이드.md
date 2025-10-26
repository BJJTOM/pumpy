# 🔧 AWS API 연결 문제 해결 가이드

## 🎯 문제 확인

✅ 웹페이지 로드: 성공 (http://3.27.28.175/)
✅ API 서버 작동: 성공 (http://3.27.28.175:8000/api/)
❌ 데이터 로딩: 실패 ("데이터를 불러오는 중..." 멈춤)

## 🔍 원인

**CORS (Cross-Origin Resource Sharing) 문제**

- 웹페이지: `http://3.27.28.175` (포트 80)
- API 서버: `http://3.27.28.175:8000` (포트 8000)
- 다른 포트 = 브라우저가 보안상 차단

---

## ✅ 해결 방법 1: Django CORS 설정 업데이트 (빠름!)

### AWS 서버에서 실행:

```bash
# 1. 서버 접속
# AWS 콘솔 → EC2 → 연결

# 2. CORS 설정 업데이트
cd /home/ubuntu/pumpy/gym_api

# 3. settings.py 편집
nano config/settings.py
```

### settings.py에서 찾아서 수정:

**찾기: `CORS_ALLOWED_ORIGINS`**

변경 전:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

변경 후:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://3.27.28.175",           # ← 추가!
    "http://3.27.28.175:3000",      # ← 추가!
]

# 또는 모든 오리진 허용 (개발용)
CORS_ALLOW_ALL_ORIGINS = True
```

### 저장 및 재시작:

```bash
# Ctrl+O (저장), Enter, Ctrl+X (종료)

# Gunicorn 재시작
sudo systemctl restart gunicorn

# 상태 확인
sudo systemctl status gunicorn
```

---

## ✅ 해결 방법 2: API URL 변경 (더 간단!)

프론트엔드가 포트 없이 `/api`로 접근하도록 수정:

### AWS 서버에서 실행:

```bash
cd /home/ubuntu/pumpy/gym_web

nano lib/api.ts
```

### api.ts 수정:

변경 전:
```typescript
const AWS_API_URL = 'http://3.27.28.175:8000/api'
```

변경 후:
```typescript
const AWS_API_URL = '/api'  // ← 상대 경로로 변경!
```

### 재빌드 및 재시작:

```bash
npm run build
pm2 restart gym_web
pm2 save
```

---

## 🚀 빠른 해결 스크립트 (전체 복사!)

AWS 서버 터미널에서 실행:

```bash
#!/bin/bash
echo "🔧 CORS 문제 해결 중..."

# 1. Django CORS 설정
cd /home/ubuntu/pumpy/gym_api

# CORS 설정 추가
cat >> config/settings.py << 'EOF'

# CORS 설정 업데이트
CORS_ALLOW_ALL_ORIGINS = True  # 개발용
EOF

# Gunicorn 재시작
sudo systemctl restart gunicorn
echo "✅ Django 재시작 완료"

# 2. 프론트엔드 API URL 변경
cd /home/ubuntu/pumpy/gym_web

# api.ts 백업
cp lib/api.ts lib/api.ts.backup

# API URL을 상대 경로로 변경
sed -i "s|const AWS_API_URL = 'http://3.27.28.175:8000/api'|const AWS_API_URL = '/api'|g" lib/api.ts

# 재빌드
npm run build
pm2 restart gym_web
pm2 save

echo ""
echo "✅ 완료!"
echo ""
echo "🌐 브라우저 새로고침: http://3.27.28.175/"
echo ""
```

---

## 🧪 테스트

1. **브라우저에서 접속:**
   ```
   http://3.27.28.175/
   ```

2. **F12 개발자 도구 → Console 확인**
   - CORS 오류가 사라져야 함
   - 데이터가 로딩되어야 함

3. **네트워크 탭 확인**
   - `/api/members/` 요청이 200 OK 응답

---

## 🔍 브라우저에서 즉시 테스트 (임시)

브라우저 개발자 도구 Console에서:

```javascript
// API URL 임시 변경
localStorage.setItem('apiUrl', '/api')

// 또는
localStorage.setItem('apiUrl', 'http://3.27.28.175/api')

// 페이지 새로고침
location.reload()
```

---

## 📊 Nginx 프록시 설정 (최선의 방법)

AWS 서버에서:

```bash
sudo nano /etc/nginx/sites-available/pumpy
```

다음 내용 추가/수정:

```nginx
server {
    listen 80;
    server_name 3.27.28.175;

    # 프론트엔드
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API (중요!)
    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS 헤더 추가
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }

    # Django Admin
    location /admin {
        proxy_pass http://localhost:8000/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static {
        alias /home/ubuntu/pumpy/gym_api/staticfiles;
    }
}
```

활성화:

```bash
sudo ln -sf /etc/nginx/sites-available/pumpy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ 체크리스트

- [ ] Django CORS 설정 업데이트
- [ ] Gunicorn 재시작
- [ ] 프론트엔드 API URL 변경 (상대 경로)
- [ ] 프론트엔드 재빌드 및 재시작
- [ ] 브라우저 캐시 삭제
- [ ] http://3.27.28.175/ 접속 테스트
- [ ] 데이터 로딩 확인

---

## 🆘 여전히 안 되면?

### 개발자 도구 확인:

1. **F12** → **Console** 탭
   - CORS 오류 메시지 확인

2. **Network** 탭
   - API 요청 확인
   - 상태 코드 확인 (200 OK?)

3. **오류 메시지 복사해서 확인**

### 로그 확인:

```bash
# Django 로그
sudo journalctl -u gunicorn -n 50

# Nginx 로그
sudo tail -f /var/log/nginx/error.log

# 브라우저 Console 로그 확인
```

---

## 🎯 추천 해결 순서:

1. **방법 2 (API URL 변경)** ← 가장 빠름!
2. **방법 1 (CORS 설정)** ← 안전함
3. **Nginx 프록시** ← 프로덕션용 최적

---

**작성:** 2025-10-21  
**긴급도:** 🔥🔥 높음  
**예상 해결 시간:** 5분








