# 🔧 AWS 연결 문제 해결 가이드

## 🚨 문제: 흰 화면 + 응답 시간 초과

### 원인 분석
1. ❌ 서버가 실행되지 않음
2. ❌ 포트가 막혀있음 (방화벽)
3. ❌ Next.js 빌드 실패
4. ❌ API 서버 응답 없음

---

## 🎯 해결 방법 (순서대로 시도)

### 1단계: AWS 보안 그룹 확인 (가장 중요!)

#### AWS 콘솔에서 확인:
1. AWS 콘솔 → EC2 → 인스턴스
2. pumpy 인스턴스 선택
3. "보안" 탭 클릭
4. "보안 그룹" 클릭

#### 필수 인바운드 규칙:
```
✅ SSH      | TCP | 22   | 0.0.0.0/0
✅ HTTP     | TCP | 80   | 0.0.0.0/0
✅ Custom   | TCP | 3000 | 0.0.0.0/0  ← 프론트엔드
✅ Custom   | TCP | 8000 | 0.0.0.0/0  ← 백엔드
```

#### 보안 그룹 규칙 추가 방법:
1. 보안 그룹 클릭
2. "인바운드 규칙 편집" 클릭
3. "규칙 추가" 클릭
4. 다음 규칙 추가:
   - **유형**: 사용자 지정 TCP
   - **포트 범위**: 3000
   - **소스**: 0.0.0.0/0
5. 다시 "규칙 추가" 클릭
   - **유형**: 사용자 지정 TCP
   - **포트 범위**: 8000
   - **소스**: 0.0.0.0/0
6. "규칙 저장" 클릭

---

### 2단계: 서버 상태 확인

#### AWS 터미널에서 실행:

```bash
# 서비스 상태 확인
echo "=== Gunicorn 상태 ==="
sudo systemctl status gunicorn

echo ""
echo "=== PM2 상태 ==="
pm2 status

echo ""
echo "=== 포트 확인 ==="
sudo netstat -tlnp | grep -E ':(3000|8000)'
```

#### 예상 결과:
```
✅ Gunicorn: active (running)
✅ PM2: online
✅ 포트 3000: LISTEN
✅ 포트 8000: LISTEN
```

---

### 3단계: 서비스 강제 재시작

AWS 터미널에서 다음을 **전체 복사해서 붙여넣기**:

```bash
#!/bin/bash
echo "================================================"
echo "  🔧 서비스 강제 재시작"
echo "================================================"

# 기존 프로세스 종료
echo "[1/4] 기존 프로세스 종료 중..."
pm2 delete all 2>/dev/null || echo "PM2 프로세스 없음"
sudo systemctl stop gunicorn 2>/dev/null || echo "Gunicorn 중지됨"
sudo fuser -k 3000/tcp 2>/dev/null || echo "포트 3000 정리됨"
sudo fuser -k 8000/tcp 2>/dev/null || echo "포트 8000 정리됨"
sleep 2

# 백엔드 재시작
echo ""
echo "[2/4] 백엔드 재시작 중..."
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate

# 간단한 테스트
python manage.py check || { echo "❌ Django 설정 오류!"; exit 1; }

# Gunicorn 시작
if [ -f "/etc/systemd/system/gunicorn.service" ]; then
    sudo systemctl start gunicorn
    sudo systemctl status gunicorn --no-pager
else
    echo "⚠️  Gunicorn 서비스 파일이 없습니다. 수동 실행..."
    nohup gunicorn --workers 3 --bind 0.0.0.0:8000 config.wsgi:application > /tmp/gunicorn.log 2>&1 &
    echo "✅ Gunicorn 수동 시작 완료"
fi

# 프론트엔드 재시작
echo ""
echo "[3/4] 프론트엔드 재시작 중..."
cd /home/ubuntu/pumpy/gym_web

# Next.js 재빌드
npm run build

# PM2로 시작
pm2 start npm --name "gym_web" -- start
pm2 save
pm2 startup | grep sudo | bash

# 상태 확인
echo ""
echo "[4/4] 상태 확인..."
echo ""
echo "=== 포트 리스닝 확인 ==="
sudo netstat -tlnp | grep -E ':(3000|8000)' || echo "⚠️  포트가 열려있지 않습니다!"

echo ""
echo "=== PM2 상태 ==="
pm2 status

echo ""
echo "=== Gunicorn 상태 ==="
sudo systemctl is-active gunicorn 2>/dev/null || echo "Gunicorn이 systemd로 실행 중이 아닙니다"

echo ""
echo "================================================"
echo "  ✅ 재시작 완료!"
echo "================================================"
echo ""
echo "🌐 테스트 접속:"
echo "   http://3.27.28.175:3000"
echo "   http://3.27.28.175:8000/api/members/"
echo ""
echo "🔍 로그 확인:"
echo "   pm2 logs gym_web"
echo "   sudo journalctl -u gunicorn -f"
echo ""
```

---

### 4단계: API 직접 테스트

#### 로컬 PC에서 테스트:

```powershell
# PowerShell에서 실행
Invoke-WebRequest -Uri "http://3.27.28.175:8000/api/members/" -Method GET -TimeoutSec 10
```

#### 브라우저에서 테스트:
```
http://3.27.28.175:8000/api/members/
```

**예상 결과:**
- ✅ JSON 데이터가 표시되면 백엔드 정상
- ❌ 연결 거부 → 보안 그룹 확인
- ❌ 500 오류 → 백엔드 로그 확인

---

### 5단계: 프론트엔드 직접 테스트

```
http://3.27.28.175:3000
```

**예상 결과:**
- ✅ 페이지가 로딩되면 정상
- ❌ 흰 화면 → PM2 로그 확인
- ❌ 연결 거부 → 보안 그룹 확인

---

## 🔍 로그 확인 (문제 발생 시)

### 백엔드 로그:
```bash
# 최근 50줄
sudo journalctl -u gunicorn -n 50

# 실시간 로그
sudo journalctl -u gunicorn -f
```

### 프론트엔드 로그:
```bash
# PM2 로그
pm2 logs gym_web --lines 50

# 실시간 로그
pm2 logs gym_web
```

### Django 직접 실행 (디버깅):
```bash
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Next.js 직접 실행 (디버깅):
```bash
cd /home/ubuntu/pumpy/gym_web
npm run dev
```

---

## 🆘 여전히 안 되는 경우

### 옵션 1: Nginx 사용 (프록시)

```bash
# Nginx 설치
sudo apt install nginx -y

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/pumpy
```

설정 내용:
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

    # API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django Admin
    location /admin {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

활성화:
```bash
sudo ln -s /etc/nginx/sites-available/pumpy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

보안 그룹에서 **포트 80** 열기!

이제 접속:
```
http://3.27.28.175  (포트 없이!)
```

---

### 옵션 2: 간단한 서버로 테스트

```bash
# Python 간단 서버
cd /home/ubuntu/pumpy/gym_web/out
python3 -m http.server 3000
```

브라우저에서:
```
http://3.27.28.175:3000
```

---

## ✅ 체크리스트

- [ ] AWS 보안 그룹에 포트 3000, 8000 추가
- [ ] Gunicorn 실행 중 확인
- [ ] PM2 실행 중 확인
- [ ] 포트 3000, 8000 리스닝 확인
- [ ] API 응답 확인 (http://3.27.28.175:8000/api/members/)
- [ ] 웹 접속 확인 (http://3.27.28.175:3000)

---

## 📞 빠른 해결책

### 가장 빠른 해결:

1. **AWS 보안 그룹 확인** ← 가장 중요!
2. **위의 3단계 스크립트 실행**
3. **브라우저 캐시 삭제 후 재접속**

---

## 🎯 최종 확인

모든 것이 정상이면:

```bash
# AWS 터미널에서
curl http://localhost:3000
curl http://localhost:8000/api/members/
```

둘 다 응답이 오면 **보안 그룹 문제**입니다!

---

**작성 시간:** 2025-10-21  
**긴급도:** 🔥 높음





