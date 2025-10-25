# 🔥 AWS 배포 - 지금 바로 실행!

## ⚡ 빠른 실행 (복사해서 붙여넣기)

### 방법 1: SSH로 접속 (권장)

```bash
# AWS 서버 접속
ssh -i "your-key.pem" ubuntu@3.27.28.175

# 또는 비밀번호로 접속
ssh ubuntu@3.27.28.175
```

접속 후, 아래 명령어를 **모두 복사해서 한 번에 붙여넣으세요**:

```bash
cd /home/ubuntu/pumpy || cd ~/pumpy || (cd ~ && git clone https://github.com/BJJTOM/pumpy.git && cd pumpy)
git pull origin main

# Django 백엔드 배포
cd gym_api
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations && python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn

# Next.js 프론트엔드 배포
cd ../gym_web
npm install
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
pm2 delete gym-web 2>/dev/null || true
pm2 start npm --name "gym-web" -- start
pm2 save

# Nginx 재시작
sudo systemctl restart nginx

echo "✅ 배포 완료! http://3.27.28.175 접속하세요"
```

---

### 방법 2: AWS 콘솔에서 실행

1. **AWS 웹 콘솔 접속**: https://aws.amazon.com/console/
2. **EC2 > 인스턴스** 선택
3. **인스턴스 선택** > **연결** 버튼 클릭
4. **Session Manager** 또는 **EC2 Instance Connect** 사용
5. 위의 명령어를 붙여넣기

---

### 방법 3: 키 없이 접속 (포트워딩 사용)

```bash
# 로컬에서 포트워딩
ssh -L 8080:localhost:80 ubuntu@3.27.28.175

# 그 다음 위의 배포 명령어 실행
```

---

## 🔧 문제 해결

### "Permission denied" 에러
```bash
# 키 파일 권한 수정
chmod 400 your-key.pem
```

### "Connection refused" 에러
```bash
# 보안 그룹에서 SSH(22) 포트 열려있는지 확인
# AWS 콘솔 > EC2 > 보안 그룹 > 인바운드 규칙
```

### Gunicorn 오류
```bash
sudo journalctl -u gunicorn -n 50
```

### PM2 오류
```bash
pm2 logs gym-web --lines 50
```

---

## ⏱️ 예상 시간

- SSH 접속: 1분
- Django 배포: 3-5분
- Next.js 빌드: 5-10분
- **총**: 약 **10-15분**

---

## ✅ 배포 확인

배포 후 다음 URL들이 모두 작동해야 합니다:

- http://3.27.28.175 (메인)
- http://3.27.28.175/admin (관리자)
- http://3.27.28.175/app (회원 앱)
- http://3.27.28.175/api (API)

---

## 💡 지금 바로 실행하세요!

**가장 쉬운 방법**: AWS 콘솔 > EC2 Instance Connect
**가장 빠른 방법**: SSH 접속 후 명령어 붙여넣기


