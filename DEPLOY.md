# 🌐 COCO 웹 배포 가이드

## 🎯 배포 전략
- **백엔드**: Render (무료)
- **프론트엔드**: Vercel (무료)
- **데이터베이스**: Render PostgreSQL (무료)

---

## 📦 1단계: 백엔드 배포 (Render)

### 1-1. Render 계정 생성
1. https://render.com 접속
2. GitHub로 로그인 (추천)

### 1-2. GitHub 저장소 생성
1. https://github.com 접속
2. 새 저장소 생성: `coco-gym-backend`
3. 로컬에서 Git 설정:

```powershell
cd C:\Users\guddn\Downloads\COCO\gym_api

# Git 초기화
git init

# .gitignore 생성
echo ".venv" > .gitignore
echo "*.pyc" >> .gitignore
echo "__pycache__" >> .gitignore
echo "db.sqlite3" >> .gitignore
echo ".env" >> .gitignore

# 커밋
git add .
git commit -m "Initial commit"

# GitHub 연결 (본인의 저장소 URL로 변경)
git remote add origin https://github.com/[본인계정]/coco-gym-backend.git
git branch -M main
git push -u origin main
```

### 1-3. Render에서 배포
1. Render 대시보드에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub 저장소 연결: `coco-gym-backend`
4. 설정:
   - **Name**: `coco-gym-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn config.wsgi:application`
   - **Plan**: `Free`

5. 환경 변수 추가:
   ```
   DJANGO_SECRET_KEY=your-super-secret-key-here-change-this
   DEBUG=false
   ALLOWED_HOSTS=*.onrender.com
   ```

6. "Create Web Service" 클릭
7. 배포 완료 대기 (5-10분)
8. **배포된 URL 복사**: `https://coco-gym-api.onrender.com`

---

## 🚀 2단계: 프론트엔드 배포 (Vercel)

### 2-1. Vercel 계정 생성
1. https://vercel.com 접속
2. GitHub로 로그인

### 2-2. GitHub 저장소 생성
1. 새 저장소 생성: `coco-gym-frontend`
2. 로컬에서 Git 설정:

```powershell
cd C:\Users\guddn\Downloads\COCO\gym_web

# Git 초기화
git init

# 커밋
git add .
git commit -m "Initial commit"

# GitHub 연결
git remote add origin https://github.com/[본인계정]/coco-gym-frontend.git
git branch -M main
git push -u origin main
```

### 2-3. Vercel에서 배포
1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 저장소 선택: `coco-gym-frontend`
3. Framework Preset: `Next.js` (자동 감지)
4. 환경 변수 추가:
   ```
   NEXT_PUBLIC_API_BASE=https://coco-gym-api.onrender.com/api
   ```
   (위의 Render URL을 `/api` 붙여서 입력)

5. "Deploy" 클릭
6. 배포 완료 대기 (3-5분)
7. **배포된 URL 확인**: `https://coco-gym-frontend.vercel.app`

---

## ✅ 3단계: 접속 확인

### 관리자 대시보드
```
https://coco-gym-frontend.vercel.app
```

### 회원용 앱
```
https://coco-gym-frontend.vercel.app/app
```

---

## 🔧 더 쉬운 방법 (추천!)

위 방법이 복잡하다면, **Railway**를 사용하면 더 쉽습니다:

### Railway로 배포 (5분 완성!)

#### 백엔드 배포
1. https://railway.app 접속
2. GitHub로 로그인
3. "New Project" → "Deploy from GitHub repo"
4. `gym_api` 폴더를 선택
5. 자동으로 Django 감지 및 배포
6. Settings에서 환경 변수 추가:
   ```
   DEBUG=false
   ALLOWED_HOSTS=*.up.railway.app
   ```
7. 배포 URL 복사

#### 프론트엔드 배포
1. Vercel은 위와 동일
2. 또는 Netlify 사용 가능

---

## 📱 모바일 공유

배포 후 누구나 접속 가능:
- 친구에게 URL 공유
- QR 코드 생성하여 공유
- SNS에 링크 공유

---

## 🎨 커스텀 도메인 (선택사항)

### 무료 도메인
1. Freenom.com 에서 무료 도메인 등록
2. Vercel/Render에서 도메인 연결

### 유료 도메인
1. Namecheap, GoDaddy 등에서 도메인 구매
2. DNS 설정으로 연결

---

## 💾 데이터베이스 (선택사항)

현재는 SQLite 사용 중이지만, 프로덕션에서는 PostgreSQL 권장:

### Render PostgreSQL
1. Render 대시보드에서 "New +" → "PostgreSQL"
2. 무료 플랜 선택
3. 생성된 DATABASE_URL 복사
4. 백엔드 환경 변수에 추가:
   ```
   DATABASE_URL=postgresql://...
   ```

---

## 🚨 주의사항

### 무료 플랜 제한
- **Render**: 15분 비활성 시 슬립 모드 (첫 요청 시 30초 대기)
- **Vercel**: 100GB 대역폭/월
- **Railway**: 월 5달러 크레딧

### 해결 방법
1. UptimeRobot으로 5분마다 핑 (슬립 방지)
2. 또는 유료 플랜 사용 ($7-10/월)

---

## 🎯 빠른 테스트

GitHub 없이 바로 테스트하고 싶다면:

### Ngrok 사용 (임시 URL)
```powershell
# ngrok 설치
choco install ngrok

# 백엔드 터널
ngrok http 8000

# 프론트엔드 터널
ngrok http 3000
```

생성된 URL을 친구에게 공유하면 바로 접속 가능!
(단, ngrok 종료 시 URL도 사라짐)

---

## 📞 도움이 필요하면

1. GitHub 저장소만 만들면 제가 나머지 설정 도와드릴게요!
2. 또는 ngrok으로 먼저 테스트해보세요!

**어떤 방법을 선택하시겠어요?** 🎉








