# 🎯 AWS 배포 - 가장 간단한 방법 (3단계)

## ✅ 사전 확인

AWS 서버: **3.27.28.175**

## 📋 배포 3단계

### 1단계: SSH 키 설정 확인

AWS EC2 인스턴스에 접속하려면 SSH 키가 필요합니다.

**방법 A: AWS 콘솔에서 직접 접속 (가장 쉬움)**
1. AWS 콘솔 접속: https://console.aws.amazon.com/
2. EC2 → 인스턴스 → pumpy 서버 선택
3. "연결" 버튼 클릭
4. "세션 관리자" 또는 "EC2 Instance Connect" 선택

**방법 B: PowerShell/CMD에서 SSH 사용**
```powershell
# SSH 키가 있는 경우
ssh -i "pumpy-key.pem" ubuntu@3.27.28.175

# SSH 키가 없는 경우 - AWS 콘솔에서 다운로드
```

---

### 2단계: 코드 업로드

#### 옵션 1: GitHub 사용 (추천)
```bash
# AWS 서버에서 실행
cd /home/ubuntu/pumpy
git pull origin main  # 또는 git clone https://github.com/사용자명/pumpy.git
```

#### 옵션 2: 파일 직접 업로드
```powershell
# 로컬 PC에서 실행
scp -r gym_api ubuntu@3.27.28.175:/home/ubuntu/pumpy/
scp -r gym_web ubuntu@3.27.28.175:/home/ubuntu/pumpy/
```

#### 옵션 3: FileZilla 사용
1. FileZilla 다운로드: https://filezilla-project.org/
2. 호스트: `sftp://3.27.28.175`
3. 사용자: `ubuntu`
4. 비밀번호: (SSH 키 사용)
5. `gym_api`, `gym_web` 폴더 드래그 앤 드롭

---

### 3단계: 서버 업데이트 스크립트 실행

AWS 서버에서 다음 명령어 실행:

```bash
#!/bin/bash
# 한 번에 복사해서 붙여넣기!

cd /home/ubuntu/pumpy

# 백엔드 업데이트
echo "🔧 백엔드 업데이트 중..."
cd gym_api
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt --quiet
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn 2>/dev/null || echo "⚠️ Gunicorn 서비스 설정 필요"

# 프론트엔드 업데이트
echo "🔧 프론트엔드 업데이트 중..."
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 restart gym_web 2>/dev/null || pm2 start npm --name "gym_web" -- start
pm2 save

echo ""
echo "✅ 배포 완료!"
echo ""
echo "🌐 접속 주소:"
echo "   웹: http://3.27.28.175:3000"
echo "   API: http://3.27.28.175:8000/api"
echo "   관리자: http://3.27.28.175:8000/admin"
```

---

## 🚀 초간단 배포 (Gunicorn/PM2가 없는 경우)

만약 위 스크립트가 작동하지 않으면, 서버를 처음부터 설정해야 합니다.

### 완전 자동 설정 스크립트

AWS 서버에서 다음을 복사해서 실행:

```bash
#!/bin/bash
# 완전 자동 설정 및 배포 스크립트

set -e
cd /home/ubuntu

# 1. 프로젝트 폴더 생성
mkdir -p pumpy
cd pumpy

# 2. Python 가상환경 설정
echo "🔧 Python 가상환경 설정 중..."
cd gym_api
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# 3. 데이터베이스 설정
echo "🔧 데이터베이스 설정 중..."
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# 4. Gunicorn 서비스 파일 생성
echo "🔧 Gunicorn 서비스 설정 중..."
sudo tee /etc/systemd/system/gunicorn.service > /dev/null <<EOF
[Unit]
Description=Gunicorn for Pumpy API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/pumpy/gym_api
ExecStart=/home/ubuntu/pumpy/gym_api/venv/bin/gunicorn \\
    --workers 3 \\
    --bind 0.0.0.0:8000 \\
    config.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# 5. Gunicorn 시작
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn

# 6. Node.js 및 PM2 설치
echo "🔧 Node.js 설정 중..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 7. 프론트엔드 빌드 및 실행
echo "🔧 프론트엔드 빌드 중..."
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 start npm --name "gym_web" -- start
pm2 save
pm2 startup

echo ""
echo "========================================="
echo "  ✅ 설치 및 배포 완료!"
echo "========================================="
echo ""
echo "🌐 접속 주소:"
echo "   웹: http://3.27.28.175:3000"
echo "   API: http://3.27.28.175:8000/api"
echo "   관리자: http://3.27.28.175:8000/admin"
echo ""
echo "🔍 상태 확인:"
echo "   sudo systemctl status gunicorn"
echo "   pm2 status"
echo ""
```

---

## 🎯 가장 빠른 방법 요약

1. **AWS 콘솔 접속** → EC2 → 연결 버튼 클릭
2. **코드 업로드** (GitHub 또는 파일 복사)
3. **배포 스크립트 실행** (위의 스크립트 복사 & 붙여넣기)
4. **브라우저에서 확인**: http://3.27.28.175:3000

---

## ❓ 문제 해결

### Q: SSH 키가 없어요
**A:** AWS 콘솔에서 "EC2 Instance Connect" 사용

### Q: Permission denied 오류
**A:** 명령어 앞에 `sudo` 추가

### Q: Port already in use 오류
**A:** 
```bash
# 기존 프로세스 종료
sudo systemctl stop gunicorn
pm2 delete all
sudo fuser -k 8000/tcp
sudo fuser -k 3000/tcp
```

### Q: 서버가 시작되지 않아요
**A:** 로그 확인
```bash
sudo journalctl -u gunicorn -n 50
pm2 logs gym_web
```

---

## 📱 배포 후 할 일

1. **브라우저에서 테스트**
   ```
   http://3.27.28.175:3000
   ```

2. **API 테스트**
   ```
   http://3.27.28.175:8000/api/members/
   ```

3. **관리자 계정 생성** (아직 없는 경우)
   ```bash
   cd /home/ubuntu/pumpy/gym_api
   source venv/bin/activate
   python manage.py createsuperuser
   ```

4. **방화벽 확인**
   - AWS 보안 그룹에서 포트 3000, 8000 오픈

---

## 💡 도움이 필요하면?

### 로그 확인
```bash
# 백엔드 로그
sudo journalctl -u gunicorn -f

# 프론트엔드 로그
pm2 logs gym_web

# 시스템 로그
sudo tail -f /var/log/syslog
```

### 서비스 재시작
```bash
sudo systemctl restart gunicorn
pm2 restart gym_web
```

### 서비스 상태 확인
```bash
sudo systemctl status gunicorn
pm2 status
```

---

**다음 단계:** 배포 완료 후 http://3.27.28.175:3000 접속하여 확인하세요! 🎉





