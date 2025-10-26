# 🚀 펌피(Pumpy) AWS 배포 완벽 가이드

## 📋 목차
1. [AWS 서비스 선택](#aws-서비스-선택)
2. [방법 1: AWS Elastic Beanstalk (추천 - 가장 쉬움)](#방법-1-aws-elastic-beanstalk)
3. [방법 2: AWS EC2 (중급)](#방법-2-aws-ec2)
4. [방법 3: AWS Lightsail (가장 저렴)](#방법-3-aws-lightsail)
5. [데이터베이스 설정](#데이터베이스-설정)
6. [도메인 연결](#도메인-연결)

---

## 🎯 AWS 서비스 선택

### 추천 방법 비교

| 방법 | 난이도 | 월 비용 | 장점 | 단점 |
|------|--------|---------|------|------|
| **Elastic Beanstalk** | ⭐ 쉬움 | $15-30 | 자동 배포, 관리 편함 | 비용 중간 |
| **Lightsail** | ⭐⭐ 보통 | $5-10 | 가장 저렴 | 제한적 확장성 |
| **EC2** | ⭐⭐⭐ 어려움 | $10-20 | 완전한 제어 | 설정 복잡 |
| **App Runner** | ⭐ 쉬움 | $5-15 | 컨테이너 기반 | 커스터마이징 제한 |

### 🏆 초보자 추천: AWS Lightsail
- 가장 저렴 ($5/월)
- 고정 가격
- 설정 간단
- 프리티어 첫 3개월 무료

---

## 🚀 방법 1: AWS Lightsail (추천!)

### 장점
- ✅ 가장 저렴함 ($5/월)
- ✅ 설정이 간단함
- ✅ 고정 IP 무료 제공
- ✅ 첫 3개월 무료
- ✅ 데이터베이스 포함 옵션

### 1단계: Lightsail 인스턴스 생성

#### 1-1. AWS 콘솔 접속
```
https://lightsail.aws.amazon.com/
```

#### 1-2. 인스턴스 생성
1. "Create instance" 클릭
2. **Region**: Seoul (ap-northeast-2) 선택
3. **Platform**: Linux/Unix
4. **Blueprint**: OS Only → Ubuntu 22.04 LTS

#### 1-3. 인스턴스 플랜 선택
- **추천**: $5/월 (1GB RAM, 40GB SSD)
- 프리티어: 첫 3개월 무료

#### 1-4. 인스턴스 이름
```
pumpy-server
```

#### 1-5. "Create instance" 클릭

---

### 2단계: SSH 접속 및 서버 설정

#### 2-1. Lightsail 콘솔에서 SSH 접속
- 인스턴스 클릭
- "Connect using SSH" 클릭

#### 2-2. 서버 업데이트
```bash
sudo apt update
sudo apt upgrade -y
```

#### 2-3. Python 및 필수 패키지 설치
```bash
# Python 설치
sudo apt install python3 python3-pip python3-venv -y

# Node.js 설치 (프론트엔드용)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Nginx 설치 (웹서버)
sudo apt install nginx -y

# PostgreSQL 설치 (데이터베이스)
sudo apt install postgresql postgresql-contrib -y

# Git 설치
sudo apt install git -y
```

---

### 3단계: 프로젝트 업로드

#### 방법 A: Git 사용 (추천)

```bash
# GitHub에 코드가 업로드되어 있는 경우
cd /home/ubuntu
git clone https://github.com/BJJTOM/pumpy.git
cd pumpy
```

#### 방법 B: 파일 직접 업로드

Lightsail 콘솔에서:
1. "Networking" 탭
2. "IPv4 Firewall" 에서 SFTP(22) 포트 열기
3. FileZilla 등으로 파일 업로드

---

### 4단계: 백엔드(Django) 설정

```bash
# 백엔드 디렉토리로 이동
cd /home/ubuntu/pumpy/gym_api

# 가상환경 생성
python3 -m venv venv
source venv/bin/activate

# 패키지 설치
pip install --upgrade pip
pip install -r requirements.txt

# Gunicorn 설치 (프로덕션 서버)
pip install gunicorn

# PostgreSQL 설정
sudo -u postgres psql
```

#### PostgreSQL에서 실행:
```sql
CREATE DATABASE pumpy_db;
CREATE USER pumpy_user WITH PASSWORD 'your-secure-password-here';
ALTER ROLE pumpy_user SET client_encoding TO 'utf8';
ALTER ROLE pumpy_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE pumpy_user SET timezone TO 'Asia/Seoul';
GRANT ALL PRIVILEGES ON DATABASE pumpy_db TO pumpy_user;
\q
```

#### Django 설정 파일 수정
```bash
nano config/settings.py
```

다음 내용 수정:
```python
# ALLOWED_HOSTS
ALLOWED_HOSTS = ['*']  # 나중에 도메인으로 변경

# 데이터베이스 설정
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pumpy_db',
        'USER': 'pumpy_user',
        'PASSWORD': 'your-secure-password-here',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Static files
STATIC_ROOT = '/home/ubuntu/pumpy/gym_api/staticfiles'
```

#### Django 마이그레이션 및 정적 파일 수집
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# 슈퍼유저 생성 (관리자)
python manage.py createsuperuser
```

---

### 5단계: Gunicorn 서비스 설정

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

다음 내용 입력:
```ini
[Unit]
Description=Gunicorn daemon for Pumpy API
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

서비스 시작:
```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn
```

---

### 6단계: Nginx 설정

```bash
sudo nano /etc/nginx/sites-available/pumpy
```

다음 내용 입력:
```nginx
server {
    listen 80;
    server_name your-lightsail-ip;

    # API (백엔드)
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static {
        alias /home/ubuntu/pumpy/gym_api/staticfiles;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Nginx 설정 활성화:
```bash
sudo ln -s /etc/nginx/sites-available/pumpy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 7단계: 프론트엔드(Next.js) 설정

```bash
cd /home/ubuntu/pumpy/gym_web

# 패키지 설치
npm install

# PM2 설치 (Node.js 프로세스 관리자)
sudo npm install -g pm2

# Next.js 빌드
npm run build

# PM2로 실행
pm2 start npm --name "pumpy-web" -- start
pm2 save
pm2 startup
```

---

### 8단계: 방화벽 설정 (Lightsail)

Lightsail 콘솔에서:
1. 인스턴스 선택
2. "Networking" 탭
3. "IPv4 Firewall" 섹션에서 다음 포트 열기:
   - HTTP (80)
   - HTTPS (443)
   - Custom (8000) - API 직접 접근용

---

### 9단계: 고정 IP 할당

1. Lightsail 콘솔에서 "Networking" 탭
2. "Create static IP" 클릭
3. 인스턴스에 연결
4. 고정 IP 주소 확인 (예: 13.124.xxx.xxx)

---

### 10단계: API URL 업데이트

#### 프론트엔드 API URL 수정
```bash
cd /home/ubuntu/pumpy/gym_web
nano lib/api.ts
```

다음 내용으로 수정:
```typescript
export const getApiUrl = async (): Promise<string> => {
  // AWS Lightsail IP 주소로 변경
  return 'http://YOUR_STATIC_IP/api';
};
```

재빌드:
```bash
npm run build
pm2 restart pumpy-web
```

---

## 📱 앱에서 접속

### React Native 앱 설정

#### API URL 수정
```bash
# 로컬 PC에서
cd C:\Users\guddn\Downloads\COCO\PumpyApp\src\utils
notepad api.ts
```

다음으로 변경:
```typescript
export const getApiUrl = async (): Promise<string> => {
  // AWS Lightsail 주소
  return 'http://YOUR_STATIC_IP/api';
};
```

#### APK 재빌드
```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android
.\gradlew assembleRelease
```

---

## 🔒 HTTPS 설정 (무료 SSL)

### Certbot으로 Let's Encrypt SSL 인증서 설치

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# 도메인이 있는 경우
sudo certbot --nginx -d yourdomain.com

# 도메인이 없는 경우 (IP만)
# CloudFlare나 무료 도메인 서비스 사용 추천
```

---

## 💰 비용 예상

### AWS Lightsail (추천)
- **인스턴스**: $5/월 (1GB RAM)
- **데이터 전송**: 1TB 포함
- **고정 IP**: 무료
- **첫 3개월**: 무료

### 총 예상 비용: **$5/월** (첫 3개월 무료)

---

## 🔍 테스트

### 1. API 테스트
```bash
# 서버에서 테스트
curl http://localhost:8000/api/members/

# 외부에서 테스트 (PC에서)
curl http://YOUR_STATIC_IP/api/members/
```

### 2. 웹 접속
```
http://YOUR_STATIC_IP/
```

### 3. 관리자 페이지
```
http://YOUR_STATIC_IP/admin
```

---

## 📊 모니터링 및 로그

### Gunicorn 로그
```bash
sudo journalctl -u gunicorn -f
```

### Nginx 로그
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### PM2 로그
```bash
pm2 logs pumpy-web
```

---

## 🔄 업데이트 방법

```bash
# 백엔드 업데이트
cd /home/ubuntu/pumpy/gym_api
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn

# 프론트엔드 업데이트
cd /home/ubuntu/pumpy/gym_web
git pull
npm install
npm run build
pm2 restart pumpy-web
```

---

## 🆘 문제 해결

### 502 Bad Gateway
```bash
# Gunicorn 상태 확인
sudo systemctl status gunicorn
sudo systemctl restart gunicorn

# Nginx 상태 확인
sudo systemctl status nginx
sudo systemctl restart nginx
```

### 데이터베이스 연결 오류
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Static files 안 보이는 경우
```bash
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

---

## 🎯 요약

### ✅ 완료해야 할 작업:

1. ✅ AWS Lightsail 계정 생성
2. ✅ Ubuntu 인스턴스 생성
3. ✅ SSH 접속
4. ✅ 패키지 설치 (Python, Node.js, Nginx, PostgreSQL)
5. ✅ 코드 업로드 (Git 또는 SFTP)
6. ✅ 데이터베이스 설정
7. ✅ Django 마이그레이션
8. ✅ Gunicorn 서비스 설정
9. ✅ Nginx 설정
10. ✅ Next.js 빌드 및 PM2 실행
11. ✅ 방화벽 포트 열기
12. ✅ 고정 IP 할당
13. ✅ 앱 API URL 변경
14. ✅ APK 재빌드
15. ✅ 테스트!

---

## 📞 접속 정보 (배포 후)

```
웹사이트: http://YOUR_STATIC_IP/
API: http://YOUR_STATIC_IP/api/
관리자: http://YOUR_STATIC_IP/admin/
```

---

## 🚀 다음 단계

1. 도메인 구입 (선택사항)
2. HTTPS 설정 (Let's Encrypt)
3. 백업 설정
4. 모니터링 설정 (CloudWatch)
5. 자동 배포 설정 (GitHub Actions)

---

생성 일시: 2025-10-15
작성자: AI Assistant










