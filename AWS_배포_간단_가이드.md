# 🚀 AWS 배포 - 빠른 실행 가이드

## 현재 상태 ✅
- 로컬 Django: 포트 8000 ✅
- 로컬 Next.js: 포트 3000 ✅
- APK 파일: Pumpy_v2.2_Latest.apk ✅

---

## 방법 1: SSH를 통한 직접 배포 (가장 빠름)

### 1단계: SSH 접속 확인
```powershell
ssh ubuntu@3.27.28.175
```

접속이 되면 다음 단계로, 안 되면 방법 2를 사용하세요.

### 2단계: 파일 업로드 및 서버 재시작

```powershell
# Windows PowerShell에서 실행

# 백엔드 업로드
scp -r gym_api/members ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_api/
scp gym_api/config/settings.py ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_api/config/
scp gym_api/requirements.txt ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_api/

# 프론트엔드 업로드
scp -r gym_web/app ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/
scp gym_web/lib/api.ts ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/lib/

# 서버 재시작
ssh ubuntu@3.27.28.175 "cd /home/ubuntu/pumpy/gym_api && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && sudo systemctl restart gunicorn"

ssh ubuntu@3.27.28.175 "cd /home/ubuntu/pumpy/gym_web && npm install && npm run build && pm2 restart gym_web"
```

---

## 방법 2: Git을 통한 배포 (SSH 접속 없이)

### 1단계: 코드를 Git에 푸시

```powershell
# 현재 COCO 디렉토리에서
git add .
git commit -m "Update: AI character, attendance stats, workout history"
git push origin main
```

### 2단계: AWS 서버에서 풀 (SSH 필요)

```bash
ssh ubuntu@3.27.28.175
cd /home/ubuntu/pumpy
git pull origin main

# 백엔드 재시작
cd gym_api
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn

# 프론트엔드 재시작
cd ../gym_web
npm install
npm run build
pm2 restart gym_web

exit
```

---

## 방법 3: AWS 웹 콘솔을 통한 수동 업로드

### 1단계: 파일 압축

```powershell
# 백엔드 압축
Compress-Archive -Path gym_api\members -DestinationPath backend_update.zip -Force

# 프론트엔드 압축
Compress-Archive -Path gym_web\app -DestinationPath frontend_update.zip -Force
```

### 2단계: AWS 콘솔에서 업로드
1. EC2 인스턴스 연결
2. 파일 업로드
3. 압축 해제 및 서버 재시작

---

## 배포 후 확인

### 웹 브라우저에서 접속
```
http://3.27.28.175:3000/app
```

### 확인 사항
- [ ] AI 캐릭터 이미지가 표시되는가?
- [ ] 출석 통계 (연속일, 이번 달, 총 출석)가 보이는가?
- [ ] 신체 정보가 표시되는가?
- [ ] 커뮤니티가 작동하는가?

---

## APK 설치 및 테스트

### APK 파일
```
C:\Users\guddn\Downloads\COCO\Pumpy_v2.2_Latest.apk
```

### 설치 방법
1. APK 파일을 스마트폰으로 전송
2. 파일 탭 → 설치
3. 앱 실행 → 로그인
4. 홈 화면 확인

---

## 문제 해결

### SSH 접속 안 될 때
```powershell
# SSH 키 위치 확인
dir $env:USERPROFILE\.ssh\

# 키가 없으면 AWS 콘솔에서 키 다운로드 필요
```

### 서버 상태 확인
```bash
ssh ubuntu@3.27.28.175

# Django 확인
sudo systemctl status gunicorn

# Next.js 확인
pm2 status

# 로그 확인
pm2 logs gym_web
sudo journalctl -u gunicorn -f
```

---

## 요약

### 가장 빠른 방법
SSH가 설정되어 있다면:
```powershell
.\deploy_to_aws_full.ps1
```

### SSH 설정이 없다면
1. Git push → AWS에서 pull
2. 또는 AWS 콘솔에서 수동 업로드

---

**중요**: AWS 배포를 위해서는 SSH 접속 권한이 필요합니다.






