# 🔑 AWS 서버 접속 및 배포 방법

## ❌ 현재 문제
```
Permission denied (publickey)
```
SSH 키가 설정되지 않아 AWS 서버에 접속할 수 없습니다.

---

## ✅ 해결 방법 3가지

### 방법 1: SSH 키 설정 (추천)

#### 1-1. AWS에서 키 다운로드
1. AWS EC2 콘솔 접속
2. 인스턴스 선택
3. "연결" 버튼 클릭
4. SSH 키 파일(.pem) 다운로드

#### 1-2. 키 파일 설정 (Windows)
```powershell
# 키 파일을 적절한 위치로 이동
mkdir C:\Users\guddn\.ssh
copy pumpy-key.pem C:\Users\guddn\.ssh\

# 키 파일 권한 설정 (중요!)
icacls C:\Users\guddn\.ssh\pumpy-key.pem /inheritance:r
icacls C:\Users\guddn\.ssh\pumpy-key.pem /grant:r "%USERNAME%:R"
```

#### 1-3. SSH 설정 파일 생성
파일: `C:\Users\guddn\.ssh\config`
```
Host pumpy-aws
    HostName 3.27.28.175
    User ubuntu
    IdentityFile C:\Users\guddn\.ssh\pumpy-key.pem
```

#### 1-4. 배포 스크립트 수정
```powershell
# SSH 키를 사용하도록 수정
scp -i C:\Users\guddn\.ssh\pumpy-key.pem -r gym_api/members ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_api/
```

---

### 방법 2: Git을 통한 배포 (가장 쉬움)

#### 2-1. GitHub 저장소 생성
1. GitHub.com 접속
2. New Repository 생성
3. Repository 이름: `pumpy` (또는 원하는 이름)
4. Private 선택

#### 2-2. 로컬 코드를 Git에 푸시
```powershell
cd C:\Users\guddn\Downloads\COCO

# Git 초기화 (처음만)
git init
git add .
git commit -m "Update: AI character, community features"

# GitHub 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/pumpy.git
git branch -M main
git push -u origin main
```

#### 2-3. AWS 서버에서 풀
**AWS 콘솔의 "Session Manager"나 "EC2 Instance Connect"로 접속 후:**
```bash
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
```

---

### 방법 3: AWS 콘솔에서 직접 접속

#### 3-1. EC2 Instance Connect 사용
1. AWS EC2 콘솔 접속
2. 인스턴스 선택
3. "연결" 버튼 클릭
4. "EC2 Instance Connect" 탭
5. "연결" 클릭 → 브라우저에서 터미널 열림

#### 3-2. 파일 업로드
브라우저 터미널에서:
```bash
# GitHub에서 클론 (방법 2 사용 시)
cd /home/ubuntu/pumpy
git pull origin main

# 또는 파일 직접 편집
nano /home/ubuntu/pumpy/gym_web/app/app/page.tsx
# 내용 복사/붙여넣기

# 서버 재시작
sudo systemctl restart gunicorn
cd /home/ubuntu/pumpy/gym_web
npm run build
pm2 restart gym_web
```

---

## 🎯 추천 순서

### 가장 빠른 방법: Git 사용
```
1. Git 저장소 생성 (GitHub/GitLab)
2. 로컬 코드 푸시
3. AWS에서 git pull
4. 서버 재시작
```

### 장기적으로 가장 좋은 방법: SSH 키 설정
```
1. AWS에서 SSH 키 다운로드
2. 키 파일 권한 설정
3. SSH config 설정
4. 배포 스크립트 실행
```

---

## 📦 배포할 주요 파일들

### 백엔드 (gym_api/)
```
gym_api/
  ├── members/           # 회원 관리 앱
  │   ├── models.py
  │   ├── views.py
  │   ├── serializers.py
  │   ├── community_models.py
  │   ├── community_views.py
  │   └── ...
  ├── config/
  │   ├── settings.py
  │   └── urls.py
  └── requirements.txt
```

### 프론트엔드 (gym_web/)
```
gym_web/
  ├── app/
  │   ├── app/           # 앱 화면들
  │   │   ├── page.tsx
  │   │   ├── community/
  │   │   ├── profile/
  │   │   └── ...
  │   ├── admin/
  │   └── ...
  ├── lib/
  │   └── api.ts
  └── package.json
```

---

## 🔍 현재 상황

### 로컬 환경
```
✅ AI 캐릭터 이미지
✅ 출석 통계 (연속일, 이번 달, 총 출석)
✅ 커뮤니티 기능 (게시글, 댓글, 좋아요)
✅ 신체 정보
✅ 모든 기능 작동
```

### AWS 서버 (현재)
```
❌ 구버전 코드
❌ 일부 기능 누락
❌ 로컬과 다름
```

### AWS 서버 (배포 후)
```
✅ 최신 코드
✅ 모든 기능 작동
✅ 로컬과 동일
```

---

## 💡 간단한 임시 해결책

AWS 콘솔에서 직접 코드 수정:

### 1. AWS EC2 Instance Connect로 접속
### 2. 주요 파일 수정
```bash
# HomeScreen에 AI 이미지 추가
nano /home/ubuntu/pumpy/gym_web/app/app/page.tsx

# 커뮤니티 기능 활성화
nano /home/ubuntu/pumpy/gym_web/app/app/community/page.tsx
```

### 3. 서버 재시작
```bash
cd /home/ubuntu/pumpy/gym_web
npm run build
pm2 restart gym_web
```

---

## ✅ 다음 단계

1. **SSH 키 설정하기** (장기적으로 가장 좋음)
   - AWS에서 .pem 키 다운로드
   - 키 권한 설정
   - 배포 스크립트 실행

2. **Git 사용하기** (가장 빠름)
   - GitHub 저장소 생성
   - 코드 푸시
   - AWS에서 pull

3. **AWS 콘솔 사용하기** (SSH 키 없이)
   - EC2 Instance Connect로 접속
   - 직접 코드 수정 또는 git pull

---

어떤 방법을 사용하시겠어요?

1️⃣ SSH 키 설정 (AWS에서 키 파일이 있으신가요?)
2️⃣ Git 사용 (GitHub 계정이 있으신가요?)
3️⃣ AWS 콘솔 직접 접속 (가장 빠름, 지금 바로 가능)

알려주시면 해당 방법으로 진행하겠습니다!






