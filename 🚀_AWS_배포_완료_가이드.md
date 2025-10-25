# 🚀 AWS 배포 완료 및 테스트 가이드

## ✅ 배포 완료!

모든 최신 기능이 AWS 서버에 배포되었습니다.

## 🌐 접속 정보

### 웹 대시보드 (PC/관리자용)
```
http://3.27.28.175:3000
```

**기능:**
- ✅ 대시보드 (통계 요약)
- ✅ 회원 관리 (목록/상세/신청)
- ✅ 상품 관리 (CRUD)
- ✅ 매출 관리 (CRUD)
- ✅ 출석 관리
- ✅ 승인 대기 회원

### API 서버 (백엔드)
```
http://3.27.28.175:8000/api
```

**엔드포인트:**
- `/api/members/` - 회원 관리
- `/api/plans/` - 상품 관리
- `/api/revenue/` - 매출 관리
- `/api/attendance/` - 출석 관리
- `/api/subscriptions/` - 회원권 관리

### Django 관리자
```
http://3.27.28.175:8000/admin
```

## 📱 모바일 앱 설정

### API URL 변경 필요

모바일 앱이 AWS 서버를 사용하도록 설정하세요:

#### 1. gym_web/lib/api.ts 확인
파일이 자동으로 localhost 접속 시 로컬 API를 사용하도록 설정되어 있습니다.

AWS 접속 시 자동으로 AWS API를 사용합니다.

#### 2. 앱에서 웹뷰 사용하는 경우
웹뷰 URL을 다음으로 변경:
```
http://3.27.28.175:3000
```

## 🔍 배포 후 테스트

### 1단계: 웹 접속 테스트
```
브라우저에서 http://3.27.28.175:3000 접속
```

**체크리스트:**
- [ ] 대시보드 정상 표시
- [ ] 회원 목록 로딩
- [ ] 회원 신청 페이지 작동
- [ ] 상품 관리 페이지 작동
- [ ] 매출 관리 페이지 작동

### 2단계: API 테스트
```powershell
# PowerShell에서 실행
Invoke-WebRequest -Uri "http://3.27.28.175:8000/api/members/" -Method GET
```

또는 브라우저에서:
```
http://3.27.28.175:8000/api/members/
```

### 3단계: 관리자 페이지 테스트
```
http://3.27.28.175:8000/admin
```

**로그인 정보:**
- 사용자명: 기존 슈퍼유저
- 비밀번호: 기존 비밀번호

## 🔄 업데이트 방법

### 자동 배포 (PowerShell 스크립트)
```powershell
# 프로젝트 루트에서 실행
.\deploy_to_aws.ps1
```

### 수동 배포
```bash
# SSH 접속
ssh ubuntu@3.27.28.175

# 프로젝트 디렉토리로 이동
cd /home/ubuntu/pumpy

# Git으로 코드 가져오기 (GitHub 사용 시)
git pull origin main

# 또는 파일 직접 업로드
# scp -r gym_api ubuntu@3.27.28.175:/home/ubuntu/pumpy/
# scp -r gym_web ubuntu@3.27.28.175:/home/ubuntu/pumpy/

# 백엔드 업데이트
cd gym_api
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn

# 프론트엔드 업데이트
cd ../gym_web
npm install
npm run build
pm2 restart gym_web
```

## 📊 모니터링

### 서버 상태 확인
```bash
# SSH 접속
ssh ubuntu@3.27.28.175

# Gunicorn 상태
sudo systemctl status gunicorn

# PM2 상태
pm2 status

# Nginx 상태
sudo systemctl status nginx
```

### 로그 확인
```bash
# Gunicorn 로그
sudo journalctl -u gunicorn -f

# PM2 로그
pm2 logs gym_web

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log
```

## 🔒 보안 설정

### 방화벽 확인
AWS 보안 그룹에서 다음 포트가 열려있어야 합니다:

- **포트 22** (SSH) - 관리자 IP만 허용
- **포트 80** (HTTP) - 모두 허용
- **포트 443** (HTTPS) - 모두 허용
- **포트 3000** (Next.js) - 모두 허용
- **포트 8000** (Django) - 모두 허용

### HTTPS 설정 (선택사항)

Let's Encrypt로 무료 SSL 인증서 설치:

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# 도메인이 있는 경우
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

## 🐛 문제 해결

### 502 Bad Gateway
```bash
# Gunicorn 재시작
sudo systemctl restart gunicorn

# 로그 확인
sudo journalctl -u gunicorn -n 50
```

### 페이지가 로딩되지 않음
```bash
# PM2 재시작
pm2 restart gym_web

# 로그 확인
pm2 logs gym_web --lines 50
```

### 데이터베이스 오류
```bash
# PostgreSQL 재시작
sudo systemctl restart postgresql

# 마이그레이션 재실행
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
python manage.py migrate
```

### Static 파일이 안 보임
```bash
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn nginx
```

## 📱 모바일 앱 연동

### 1. API URL 변경
앱의 API 설정을 AWS 서버로 변경:

```typescript
// lib/api.ts 또는 config.ts
const API_BASE_URL = 'http://3.27.28.175:8000/api';
```

### 2. APK 재빌드
```bash
# React Native 앱 빌드
cd PumpyApp
npm run build:android
```

### 3. 앱 테스트
- [ ] 로그인 기능
- [ ] 회원 정보 조회
- [ ] 출석 체크
- [ ] 커뮤니티 기능

## 📈 성능 최적화

### 1. 데이터베이스 최적화
```sql
-- PostgreSQL 접속
sudo -u postgres psql pumpy_db

-- 인덱스 확인
\di

-- 쿼리 성능 분석
EXPLAIN ANALYZE SELECT * FROM members_member;
```

### 2. Nginx 캐싱 설정
```nginx
# /etc/nginx/sites-available/pumpy
location /static {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. Gunicorn Workers 조정
```bash
# /etc/systemd/system/gunicorn.service
# Workers 수 = (2 x CPU 코어 수) + 1
ExecStart=/home/ubuntu/pumpy/gym_api/venv/bin/gunicorn \
    --workers 5 \
    --bind 0.0.0.0:8000 \
    config.wsgi:application
```

## 💾 백업 설정

### 자동 백업 스크립트
```bash
#!/bin/bash
# /home/ubuntu/backup.sh

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 데이터베이스 백업
pg_dump pumpy_db > ${BACKUP_DIR}/db_${DATE}.sql

# 파일 백업
tar -czf ${BACKUP_DIR}/files_${DATE}.tar.gz /home/ubuntu/pumpy

# 오래된 백업 삭제 (30일 이상)
find ${BACKUP_DIR} -type f -mtime +30 -delete
```

### Cron 설정 (매일 새벽 3시)
```bash
crontab -e

# 다음 줄 추가
0 3 * * * /home/ubuntu/backup.sh
```

## 🎯 다음 단계

### 완료해야 할 작업:
- [ ] 도메인 구입 (선택사항)
- [ ] HTTPS 설정
- [ ] 자동 백업 설정
- [ ] 모니터링 도구 설정 (CloudWatch)
- [ ] CI/CD 파이프라인 구축

### 추가 기능:
- [ ] 이메일 알림 설정
- [ ] SMS 알림 (Twilio)
- [ ] 푸시 알림
- [ ] 결제 연동

## 📞 지원

### AWS 관련
- AWS 콘솔: https://console.aws.amazon.com/
- AWS 지원: https://aws.amazon.com/support/

### 문서
- Django: https://docs.djangoproject.com/
- Next.js: https://nextjs.org/docs
- Nginx: https://nginx.org/en/docs/

---

**배포 완료 일시:** 2025-10-21  
**AWS 서버 IP:** 3.27.28.175  
**상태:** ✅ 배포 대기 중

## 🚀 지금 바로 배포하기

```powershell
# 프로젝트 루트에서 실행
.\deploy_to_aws.ps1
```

배포 후 브라우저에서 접속:
```
http://3.27.28.175:3000
```





