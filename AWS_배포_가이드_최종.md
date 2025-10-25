# 🚀 AWS 배포 가이드 (최종)

## ✅ GitHub 푸시 완료!
커밋 ID: `ae3b016`
저장소: https://github.com/BJJTOM/pumpy.git

---

## 📋 배포 단계

### 1️⃣ AWS 서버 접속

```bash
# Windows PowerShell에서 실행
ssh -i "your-key.pem" ubuntu@3.27.28.175
```

또는 PuTTY 사용:
- Host: `3.27.28.175`
- Port: `22`
- Username: `ubuntu`

---

### 2️⃣ 프로젝트 디렉토리로 이동

```bash
cd /home/ubuntu/pumpy
```

---

### 3️⃣ GitHub에서 최신 코드 받기

```bash
# 현재 변경사항 임시 저장 (필요시)
git stash

# 최신 코드 pull
git pull origin main

# 임시 저장한 변경사항 복원 (필요시)
# git stash pop
```

---

### 4️⃣ 백엔드 업데이트 (Django)

```bash
# gym_api 디렉토리로 이동
cd /home/ubuntu/pumpy/gym_api

# 가상환경 활성화
source venv/bin/activate

# 패키지 업데이트
pip install -r requirements.txt

# 마이그레이션
python manage.py makemigrations
python manage.py migrate

# 정적 파일 수집
python manage.py collectstatic --noinput

# Gunicorn 재시작
sudo systemctl restart gunicorn

# 또는 수동 실행
# sudo fuser -k 8000/tcp
# nohup gunicorn --workers 3 --bind 0.0.0.0:8000 --chdir /home/ubuntu/pumpy/gym_api config.wsgi:application &
```

---

### 5️⃣ 프론트엔드 업데이트 (Next.js)

```bash
# gym_web 디렉토리로 이동
cd /home/ubuntu/pumpy/gym_web

# 패키지 설치
npm install

# 빌드
npm run build

# PM2 재시작
pm2 restart gym_web

# 또는 처음 실행
# pm2 delete gym_web
# pm2 start npm --name "gym_web" -- start
# pm2 save
```

---

### 6️⃣ Nginx 재시작 (필요시)

```bash
sudo systemctl restart nginx
```

---

### 7️⃣ 서비스 상태 확인

```bash
# 포트 확인
sudo netstat -tlnp | grep -E ':(80|3000|8000)'

# Gunicorn 상태
sudo systemctl status gunicorn

# PM2 상태
pm2 status

# Nginx 상태
sudo systemctl status nginx
```

---

### 8️⃣ 로그 확인

```bash
# Django 로그
sudo journalctl -u gunicorn -n 50
# 또는
tail -f /tmp/gunicorn.log

# Next.js 로그
pm2 logs gym_web

# Nginx 로그
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 빠른 배포 (원라인 스크립트)

```bash
cd /home/ubuntu/pumpy && \
git pull origin main && \
cd gym_api && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && sudo systemctl restart gunicorn && \
cd ../gym_web && npm install && npm run build && pm2 restart gym_web && \
sudo systemctl restart nginx && \
echo "✅ 배포 완료!"
```

---

## 🌐 배포 후 확인

브라우저에서 확인:
- **프론트엔드**: http://3.27.28.175
- **백엔드 API**: http://3.27.28.175/api/
- **관리자**: http://3.27.28.175/admin/

---

## 🆕 새로 추가된 기능

### 1. 커뮤니티 기능
- **경로**: http://3.27.28.175/community
- 게시글 작성, 조회, 댓글, 좋아요

### 2. 멋진 UI 개선
- 그라디언트 배경
- 떠다니는 아이콘 애니메이션
- 글래스모피즘 카드
- 빛나는 효과

---

## ⚠️ 문제 해결

### Django 서버가 시작되지 않는 경우

```bash
# 포트 확인 및 프로세스 종료
sudo fuser -k 8000/tcp

# 수동 실행
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
nohup python manage.py runserver 0.0.0.0:8000 &
```

### Next.js 빌드 에러

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules .next
npm install
npm run build
```

### 권한 문제

```bash
# 소유권 변경
sudo chown -R ubuntu:ubuntu /home/ubuntu/pumpy
```

---

## 📝 추가 작업 (선택사항)

### 환경 변수 설정

```bash
# Django 설정
nano /home/ubuntu/pumpy/gym_api/.env

# Next.js 설정 (필요시)
nano /home/ubuntu/pumpy/gym_web/.env.local
```

### 데이터베이스 백업

```bash
cd /home/ubuntu/pumpy/gym_api
python manage.py dumpdata > backup_$(date +%Y%m%d).json
```

---

## ✅ 완료 체크리스트

- [x] GitHub에 푸시
- [ ] AWS 서버 접속
- [ ] 코드 pull
- [ ] 백엔드 업데이트
- [ ] 프론트엔드 업데이트
- [ ] 서비스 재시작
- [ ] 배포 확인

---

**배포 성공 후 브라우저에서 http://3.27.28.175 를 열어 확인하세요!** 🎉

