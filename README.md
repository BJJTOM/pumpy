# 🏋️ COCO - 체육관 종합 관리 시스템

**Django REST API** + **Next.js** 기반의 현대적인 체육관 관리 서비스

---

## 📋 주요 기능

### 🔧 관리자 기능 (관장/직원용)
- **대시보드**: 매출, 출석, 회원 통계 한눈에 확인
- **회원 관리**: 상세 프로필, 출석 기록, 회원권 관리
- **회원권 관리**: 다양한 상품 등록 및 관리 (카테고리, 할인, 포함 항목)
- **매출 관리**: 실시간 매출 통계 및 목표 설정
- **출석 관리**: 출석 체크 및 시간대별 분석
- **락커 관리**: 락커 배정 및 상태 관리
- **코치 관리**: 코치 정보 및 급여 관리
- **WOD 관리**: 일일 운동 프로그램 등록
- **회원 분석**: 재등록률, 이탈 회원, 생애가치 분석

### 📱 회원용 앱 (모바일 최적화)
- **메인 화면**:
  - AI 캐릭터 생성 (프로필 이미지 → AI 캐릭터)
  - 오늘의 운동 (관장이 등록한 WOD 표시)
  - 칼로리 소모량 자동 계산
  - 식단 기록 기능
  - 운동/식단 통계 대시보드

- **커뮤니티** (SNS 스타일):
  - 스토리 기능 (24시간 후 자동 삭제)
  - 게시글 작성 (사진, 이모티콘, 태그)
  - 좋아요, 댓글, 공유
  - 실시간 피드

- **채팅** (카카오톡 스타일):
  - 1:1 채팅 (관장 ↔ 회원)
  - 그룹 채팅방
  - 실시간 메시지
  - 읽음 표시

- **내 정보**:
  - 회원권 정보 (남은 기간, 횟수)
  - 출석 일수 및 히스토리
  - 포인트 및 레벨
  - 목표 관리
  - 설정

---

## 🚀 빠른 시작

### 1️⃣ 백엔드 (Django) 실행

```powershell
# 프로젝트 디렉토리로 이동
cd C:\Users\guddn\Downloads\COCO\gym_api

# 가상환경 활성화
.\.venv\Scripts\activate

# 패키지 설치 (처음 한 번만)
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python manage.py makemigrations
python manage.py migrate

# 관리자 계정 생성 (선택사항)
python manage.py createsuperuser

# 서버 실행
python manage.py runserver 0.0.0.0:8000
```

**백엔드 서버**: `http://localhost:8000`  
**관리자 패널**: `http://localhost:8000/admin`

---

### 2️⃣ 프론트엔드 (Next.js) 실행

```powershell
# 프로젝트 디렉토리로 이동
cd C:\Users\guddn\Downloads\COCO\gym_web

# 패키지 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm run dev
```

**관리자 대시보드**: `http://localhost:3000`  
**회원용 앱**: `http://localhost:3000/app`

---

## 📱 모바일 접속 방법

### 1. PC의 IP 주소 확인
```powershell
ipconfig
```
→ `IPv4 주소` 확인 (예: `192.168.0.100`)

### 2. 방화벽 규칙 추가 (관리자 권한 필요)
```powershell
# 백엔드 포트 (8000) 허용
New-NetFirewallRule -DisplayName "Django Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow

# 프론트엔드 포트 (3000) 허용
New-NetFirewallRule -DisplayName "Next.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 3. 모바일에서 접속
- **관리자 대시보드**: `http://[PC IP주소]:3000`
- **회원용 앱**: `http://[PC IP주소]:3000/app`

예: `http://192.168.0.100:3000/app`

---

## 🎨 UI 디자인

- **디자인 언어**: Toss 스타일 (모던, 심플, 직관적)
- **컬러**: 
  - Primary: `#3182F6` (Toss Blue)
  - Gradient: Purple-Blue 계열
- **폰트**: Pretendard (시스템 폰트 fallback)
- **반응형**: 모바일 퍼스트 디자인

---

## 🛠️ 기술 스택

### Backend
- **Framework**: Django 5.2.7
- **API**: Django REST Framework
- **Database**: SQLite (개발), PostgreSQL (프로덕션 권장)
- **CORS**: django-cors-headers

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS (Inline Styles)

---

## 📂 프로젝트 구조

```
COCO/
├── gym_api/                 # 백엔드 (Django)
│   ├── config/              # 프로젝트 설정
│   ├── members/             # 회원 관리 앱
│   │   ├── models.py        # 데이터 모델 (Member, Plan, Revenue, etc.)
│   │   ├── serializers.py   # API 시리얼라이저
│   │   ├── views.py         # API 뷰
│   │   └── urls.py          # API 라우팅
│   ├── db.sqlite3           # 데이터베이스
│   └── manage.py
│
└── gym_web/                 # 프론트엔드 (Next.js)
    ├── app/
    │   ├── (관리자 페이지)
    │   │   ├── page.tsx              # 대시보드
    │   │   ├── members/              # 회원 관리
    │   │   ├── plans/                # 회원권 관리
    │   │   ├── revenue/              # 매출 관리
    │   │   ├── attendance/           # 출석 관리
    │   │   └── analytics/            # 회원 분석
    │   │
    │   └── app/                      # 회원용 앱
    │       ├── page.tsx              # 메인 (AI 캐릭터, WOD, 통계)
    │       ├── community/            # 커뮤니티 (SNS)
    │       ├── chat/                 # 채팅
    │       ├── workout/              # 운동 기록
    │       ├── meal/                 # 식단 기록
    │       ├── character/            # AI 캐릭터 생성
    │       └── profile/              # 내 정보
    │
    ├── globals.css                   # 전역 스타일
    └── package.json

```

---

## 📊 데이터 모델

### 핵심 모델
- **Member**: 회원 정보 (개인정보, 상태, 레벨, 포인트 등)
- **MembershipPlan**: 회원권 상품 (가격, 기간, 할인, 포함 항목)
- **Subscription**: 회원권 구독 내역
- **Revenue**: 매출 기록
- **Attendance**: 출석 기록
- **WOD**: 일일 운동 프로그램

### 회원용 앱 모델
- **UserProfile**: 회원 프로필 (AI 캐릭터, 목표 등)
- **WorkoutLog**: 운동 기록
- **MealLog**: 식단 기록
- **Post**: 커뮤니티 게시글
- **Comment**: 댓글
- **Story**: 스토리
- **ChatRoom / ChatMessage**: 채팅
- **Notification**: 알림

---

## 🔐 인증

**현재**: 간단한 세션 기반 (개발 단계)  
**추후**: JWT 토큰 기반 인증 권장

---

## 🚨 트러블슈팅

### 포트 충돌
```powershell
# 3000번 포트 사용 중인 프로세스 종료
Stop-Process -Name "node" -Force

# 8000번 포트 사용 중인 프로세스 종료
Stop-Process -Name "python" -Force
```

### 캐시 문제
```powershell
# Next.js 빌드 캐시 삭제
cd gym_web
Remove-Item -Recurse -Force .next
```

### 데이터베이스 초기화
```powershell
cd gym_api
Remove-Item db.sqlite3
Remove-Item -Recurse members\migrations\*.py -Exclude __init__.py
python manage.py makemigrations
python manage.py migrate
```

---

## 📈 향후 계획

- [ ] AI 캐릭터 생성 API 연동 (Stable Diffusion, DALL-E)
- [ ] 실시간 채팅 (WebSocket)
- [ ] 푸시 알림
- [ ] 결제 시스템 연동
- [ ] QR 코드 출석 체크
- [ ] 다국어 지원
- [ ] 프로그레시브 웹 앱 (PWA)

---

## 👨‍💻 개발자

- **Backend**: Django REST Framework
- **Frontend**: Next.js + TypeScript
- **Design**: Toss Design System Inspired

---

## 📝 라이선스

MIT License

---

## 💡 추가 정보

### API 엔드포인트

**관리자용 API**:
- `/api/members/` - 회원 관리
- `/api/plans/` - 회원권 관리
- `/api/revenue/` - 매출 관리
- `/api/attendance/` - 출석 관리
- `/api/wods/` - WOD 관리

**회원용 API**:
- `/api/app/profiles/` - 프로필
- `/api/app/workout-logs/` - 운동 기록
- `/api/app/meal-logs/` - 식단 기록
- `/api/app/posts/` - 커뮤니티 게시글
- `/api/app/chatrooms/` - 채팅방
- `/api/app/messages/` - 메시지

### 기본 계정 (테스트용)

**관리자 로그인**:
- ID: `admin`
- PW: `admin`

---

**🎉 즐거운 개발 되세요!**
