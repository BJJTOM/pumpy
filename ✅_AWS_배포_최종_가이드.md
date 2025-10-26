# ================================================================
# 🎯 AWS 배포 - 초간단 가이드
# ================================================================

## 📌 배포 방법 선택

### 🏆 방법 1: AWS 콘솔 직접 접속 (가장 쉬움!)

#### 1단계: AWS 콘솔 접속
1. https://console.aws.amazon.com/ 접속
2. 로그인
3. **EC2** 서비스 선택
4. **인스턴스** 클릭
5. `pumpy` 또는 IP `3.27.28.175` 인스턴스 찾기

#### 2단계: 서버 연결
1. 인스턴스 체크박스 선택
2. 우측 상단 **"연결"** 버튼 클릭
3. **"세션 관리자"** 또는 **"EC2 Instance Connect"** 탭 선택
4. **"연결"** 버튼 클릭
5. 브라우저에 터미널이 열림!

#### 3단계: 코드 업로드
**방법 A: GitHub 사용 (추천)**
```bash
cd /home/ubuntu/pumpy
git pull origin main
```

**방법 B: 파일 수동 업로드**
- AWS 콘솔 → EC2 → File Upload 기능 사용
- 또는 FileZilla 사용

#### 4단계: 배포 스크립트 실행
아래 전체를 복사해서 AWS 터미널에 붙여넣기!

```bash
#!/bin/bash
cd /home/ubuntu/pumpy

# 백엔드 업데이트
echo "🔧 백엔드 업데이트 중..."
cd gym_api
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt --quiet
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn 2>/dev/null || echo "⚠️ Gunicorn 설정 필요"

# 프론트엔드 업데이트
echo "🌐 프론트엔드 업데이트 중..."
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 restart gym_web 2>/dev/null || pm2 start npm --name "gym_web" -- start
pm2 save

echo ""
echo "✅ 배포 완료!"
echo ""
echo "🌐 접속:"
echo "   http://3.27.28.175:3000"
```

---

### 🔧 방법 2: FileZilla로 파일 전송

#### 준비물
- FileZilla 다운로드: https://filezilla-project.org/
- AWS SSH 키 (.pem 파일)

#### 단계
1. **FileZilla 실행**
2. **설정 → SFTP 추가**
   - 키 파일: `.pem` 파일 선택
3. **연결**
   - 호스트: `sftp://3.27.28.175`
   - 사용자: `ubuntu`
   - 포트: `22`
4. **파일 전송**
   - 왼쪽(로컬): `C:\Users\guddn\Downloads\COCO\gym_api`
   - 오른쪽(서버): `/home/ubuntu/pumpy/gym_api`
   - 드래그 앤 드롭으로 파일 전송
5. **프론트엔드도 동일하게 전송**
   - `gym_web` 폴더 전송
6. **AWS 콘솔 터미널에서 위의 배포 스크립트 실행**

---

### 🐙 방법 3: GitHub 사용 (자동화)

#### 1단계: GitHub에 푸시
```powershell
# 로컬에서 실행
cd C:\Users\guddn\Downloads\COCO
git add .
git commit -m "최신 기능 추가 - 회원신청/매출/상품관리"
git push origin main
```

#### 2단계: AWS에서 Pull
AWS 콘솔 터미널에서:
```bash
cd /home/ubuntu/pumpy
git pull origin main
bash update_aws.sh  # 자동 업데이트
```

---

## 🎯 배포 후 확인사항

### 1. 웹사이트 접속 테스트
```
http://3.27.28.175:3000
```

**확인:**
- [ ] 대시보드 표시
- [ ] 회원 관리 작동
- [ ] 회원 신청 작동
- [ ] 상품 관리 작동
- [ ] 매출 관리 작동

### 2. API 테스트
```
http://3.27.28.175:8000/api/members/
```

브라우저에서 JSON 데이터 확인

### 3. 관리자 페이지
```
http://3.27.28.175:8000/admin
```

로그인 가능 여부 확인

---

## 🔧 서버가 처음이면?

### 전체 서버 설정 스크립트
AWS 콘솔 터미널에서 실행:

```bash
#!/bin/bash
# 완전 자동 설정 (처음 서버 설정하는 경우)

# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. Python 설치
sudo apt install python3 python3-pip python3-venv -y

# 3. Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. PM2 설치
sudo npm install -g pm2

# 5. PostgreSQL 설치
sudo apt install postgresql postgresql-contrib -y

# 6. 데이터베이스 생성
sudo -u postgres psql << EOF
CREATE DATABASE pumpy_db;
CREATE USER pumpy_user WITH PASSWORD 'pumpy2024!@';
ALTER ROLE pumpy_user SET client_encoding TO 'utf8';
ALTER ROLE pumpy_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE pumpy_user SET timezone TO 'Asia/Seoul';
GRANT ALL PRIVILEGES ON DATABASE pumpy_db TO pumpy_user;
\q
EOF

# 7. 프로젝트 폴더 생성
mkdir -p /home/ubuntu/pumpy
cd /home/ubuntu/pumpy

# 8. Git 설정 (GitHub 사용 시)
# git clone https://github.com/사용자명/pumpy.git

echo ""
echo "✅ 서버 설정 완료!"
echo "이제 코드를 업로드하고 위의 배포 스크립트를 실행하세요."
```

### Django Settings 수정
AWS 서버에서:
```bash
cd /home/ubuntu/pumpy/gym_api
nano config/settings.py
```

다음 내용 수정:
```python
# ALLOWED_HOSTS
ALLOWED_HOSTS = ['3.27.28.175', 'localhost', '*']

# 데이터베이스
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pumpy_db',
        'USER': 'pumpy_user',
        'PASSWORD': 'pumpy2024!@',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Gunicorn 서비스 설정
```bash
sudo nano /etc/systemd/system/gunicorn.service
```

내용:
```ini
[Unit]
Description=Gunicorn for Pumpy
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/pumpy/gym_api
ExecStart=/home/ubuntu/pumpy/gym_api/venv/bin/gunicorn \
    --workers 3 \
    --bind 0.0.0.0:8000 \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

시작:
```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

---

## 🔥 긴급 문제 해결

### 서비스 재시작
```bash
sudo systemctl restart gunicorn
pm2 restart gym_web
```

### 로그 확인
```bash
# 백엔드 로그
sudo journalctl -u gunicorn -n 50

# 프론트엔드 로그
pm2 logs gym_web --lines 50
```

### 포트 충돌
```bash
sudo fuser -k 8000/tcp
sudo fuser -k 3000/tcp
```

### 방화벽 설정
AWS 보안 그룹에서:
- HTTP (80) 열기
- Custom TCP (3000) 열기
- Custom TCP (8000) 열기

---

## ✅ 배포 완료 체크리스트

- [ ] AWS 서버 접속 성공
- [ ] 코드 업로드 완료
- [ ] 백엔드 마이그레이션 완료
- [ ] Gunicorn 실행 중
- [ ] 프론트엔드 빌드 완료
- [ ] PM2 실행 중
- [ ] 웹사이트 접속 확인
- [ ] API 작동 확인
- [ ] 관리자 페이지 확인

---

## 📱 모바일 앱 연동

배포 후 모바일 앱도 업데이트:

```typescript
// gym_web/lib/api.ts 또는 앱 설정
const API_URL = 'http://3.27.28.175:8000/api';
```

---

## 🎉 배포 성공!

웹사이트 접속:
```
http://3.27.28.175:3000
```

관리자:
```
http://3.27.28.175:8000/admin
```

---

**마지막 업데이트:** 2025-10-21  
**서버 IP:** 3.27.28.175








