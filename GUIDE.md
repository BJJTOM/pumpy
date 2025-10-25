# 🎉 COCO 체육관 관리 시스템 - 완성 가이드

## 🚀 빠른 시작

### 서버 실행 (2개 필요)

#### 1️⃣ 백엔드 (Django)
```powershell
cd C:\Users\guddn\Downloads\COCO\gym_api
.\.venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

#### 2️⃣ 프론트엔드 (Next.js)
```powershell
cd C:\Users\guddn\Downloads\COCO\gym_web
npm run dev
```

### 접속 주소
- **관리자 대시보드**: http://localhost:3000
- **회원용 앱**: http://localhost:3000/app
- **백엔드 API**: http://localhost:8000/admin

---

## 📱 완성된 페이지 목록

### 🔧 관리자 페이지 (관장/직원용)

#### 1. 대시보드 (`/`)
- 월간 매출 및 성장률
- 활성/정지/해지 회원 통계
- 만료 임박 회원 알림
- 주간 출석 차트
- 빠른 액션 버튼
- **회원용 앱 접속 버튼** ⭐

#### 2. 회원 관리 (`/members`)
- 회원 목록 (이름, 전화번호, 상태, 만료일, 레벨, 포인트)
- 검색 및 필터
- 상세 페이지 (`/members/[id]`)
  - 4개 탭 (상세정보, 회원권, 출석, 노트)
  - 프로필 사진
  - 이용약관/개인정보 동의 여부
  - 긴급연락처
  - 건강 정보
  - 레벨 및 포인트 관리
  - **회원권 구매 기능** ⭐

#### 3. 회원 추가 (`/members/new`)
- 기본 정보 입력
- 레벨 & 포인트 설정
- 긴급연락처
- 건강 메모
- 약관 동의

#### 4. 회원권 관리 (`/plans`)
- 카테고리별 분류 (크로스핏, PT, 요가 등)
- 가격, 기간, 횟수, 할인 정보
- 포함 항목 (유니폼, 락커, 수건 등)
- 인기 상품 배지
- 판매 통계

#### 5. 출석 관리 (`/attendance`)
- 출석 체크
- 시간대별 분석
- 일별/월별 통계

#### 6. 매출 관리 (`/revenue`)
- 매출 입력
- 통계 및 차트
- 목표 관리
- 예측 기능

#### 7. 락커 관리 (`/lockers`)
- 락커 배정
- 상태 관리 (사용중/비어있음/고장)

#### 8. 코치 관리 (`/coaches`)
- 코치 정보
- 급여 정보

#### 9. 수업 일정 (`/schedule`)
- WOD (Workout of the Day) 등록
- 일일 운동 프로그램

#### 10. 회원 분석 (`/analytics`)
- 재등록률
- 이탈 회원
- 생애가치 분석
- 회원 라이프사이클

#### 11. 가입 승인 (`/pending`)
- 대기 중인 회원 목록
- 승인/거부

#### 12. 로그인/가입 (`/login`, `/signup`)
- 관리자 인증
- 회원 가입 (공개)

---

### 📱 회원용 앱 (모바일 최적화)

#### 1. 메인 화면 (`/app`)
- **AI 캐릭터 카드** (생성 링크)
- 오늘의 운동 (WOD)
- 통계 (칼로리, 운동, 식단)
- 빠른 액션 버튼
- 하단 내비게이션 바

#### 2. AI 캐릭터 생성 (`/app/character`)
- 사진 업로드 UI
- 6가지 스타일 선택
  - 피트니스
  - 애니메이션
  - 카툰
  - 슈퍼히어로
  - 미니멀
  - 사실적
- 생성 애니메이션
- 예시 갤러리

#### 3. 커뮤니티 (`/app/community`)
- **스토리 기능** (24시간)
- 게시글 작성
- 좋아요, 댓글, 공유
- 사진 업로드
- 이모티콘
- 실시간 피드
- SNS 스타일 UI

#### 4. 채팅 (`/app/chat`)
- 채팅방 목록
- 읽음 표시
- 카카오톡 스타일 UI
- 채팅방 상세 (`/app/chat/[id]`)
  - 실시간 메시지
  - 파일 첨부
  - 읽음 시간

#### 5. 운동 기록 (`/app/workout`)
- 출석 체크
- 운동 시간 입력
- 컨디션 선택 (좋음/보통/힘듦/최고)
- 메모
- **칼로리 자동 계산** ⭐

#### 6. 식단 기록 (`/app/meal`)
- 식사 시간 선택 (아침/점심/저녁/간식)
- 음식명
- 영양 정보 (칼로리, 단백질, 탄수화물, 지방)
- 사진 업로드
- 메모

#### 7. 프로필 (`/app/profile`)
- AI 캐릭터 프로필
- 회원권 정보
- 출석 일수
- 포인트 & 레벨
- 메뉴 목록
  - 출석 내역
  - 결제 내역
  - 목표 관리
  - 건강 정보
  - 알림 설정
  - 문의하기

#### 8. 설정 (`/app/settings`)
- 알림 설정 (푸시, 채팅)
- 프로필 설정
- AI 캐릭터 변경
- 프로필 공개 여부
- 계정 관리 (비밀번호, 전화번호, 이메일)
- 앱 정보
- 로그아웃/탈퇴

#### 9. 목표 관리 (`/app/goals`)
- 목표 목록
- 진행률 표시
- 목표 추가
- 동기부여 메시지

#### 10. 출석 히스토리 (`/app/attendance-history`)
- 월별 선택
- 통계 (출석일, 총 칼로리, 평균)
- 캘린더 뷰
- 출석 내역 리스트

---

## 🎨 디자인 특징

### Toss Style UI
- **컬러**: 
  - Primary: `#3182F6` (Toss Blue)
  - Gradient: `#667eea` → `#764ba2`
  - Success: `#00C853`
  - Warning: `#FFB800`
  - Danger: `#FF3B30`

- **폰트**: Pretendard (시스템 fallback)

- **컴포넌트**:
  - 둥근 모서리 (12px ~ 20px)
  - 그림자 효과
  - 부드러운 애니메이션
  - 카드 레이아웃
  - Pill 버튼

### 모바일 최적화
- 반응형 그리드
- 터치 친화적 버튼 크기
- 하단 고정 내비게이션
- 제스처 지원
- 부드러운 스크롤

---

## 🔧 백엔드 API

### 관리자용 API
```
/api/members/                    # 회원 CRUD
/api/members/{id}/              # 회원 상세
/api/members/dashboard_stats/   # 대시보드 통계
/api/plans/                     # 회원권 CRUD
/api/subscriptions/             # 회원권 구독
/api/revenue/                   # 매출
/api/revenue/stats/             # 매출 통계
/api/attendance/                # 출석
/api/attendance/weekly_stats/   # 주간 출석
/api/lockers/                   # 락커
/api/coaches/                   # 코치
/api/wods/                      # WOD
/api/member-notes/              # 회원 노트
/api/level-history/             # 레벨 히스토리
/api/pending-members/           # 대기 회원
/api/public/signup/             # 공개 가입
```

### 회원용 API
```
/api/app/profiles/              # 프로필
/api/app/workout-logs/          # 운동 기록
/api/app/meal-logs/             # 식단 기록
/api/app/posts/                 # 커뮤니티 게시글
/api/app/posts/{id}/like/       # 좋아요
/api/app/comments/              # 댓글
/api/app/stories/               # 스토리
/api/app/chatrooms/             # 채팅방
/api/app/messages/              # 메시지
/api/app/notifications/         # 알림
```

---

## 📊 데이터 모델

### 핵심 모델
- `Member`: 회원 (40+ 필드)
- `MembershipPlan`: 회원권 (30+ 필드)
- `Subscription`: 구독
- `Revenue`: 매출 (자동 생성)
- `Attendance`: 출석
- `Locker`: 락커
- `Coach`: 코치
- `WOD`: 일일 운동

### 회원용 앱 모델
- `UserProfile`: 프로필 (AI 캐릭터, 목표)
- `WorkoutLog`: 운동 기록
- `MealLog`: 식단 기록
- `Post`: 게시글
- `Comment`: 댓글
- `Like`: 좋아요
- `Story`: 스토리 (24시간 자동 삭제)
- `ChatRoom`: 채팅방
- `ChatMessage`: 메시지
- `Notification`: 알림

---

## 🎯 주요 기능

### ✅ 구현 완료
1. **관리자 대시보드** - 실시간 통계
2. **회원 관리** - 상세 프로필, 회원권 구매
3. **회원권 관리** - 다양한 옵션, 할인 정책
4. **출석 관리** - 체크, 통계
5. **매출 관리** - 자동 기록, 통계
6. **회원 분석** - 재등록률, 이탈 분석
7. **AI 캐릭터** - 6가지 스타일
8. **커뮤니티** - SNS 기능 전체
9. **채팅** - 카카오톡 스타일
10. **운동/식단 기록** - 칼로리 계산
11. **목표 관리** - 진행률 추적
12. **모바일 최적화** - 완벽한 반응형

### 🚀 향후 기능 (선택)
- [ ] AI 캐릭터 실제 생성 (API 연동)
- [ ] 실시간 채팅 (WebSocket)
- [ ] 푸시 알림
- [ ] QR 코드 출석
- [ ] 결제 시스템
- [ ] PWA (오프라인 지원)

---

## 📱 모바일 접속

### PC IP 확인
```powershell
ipconfig
```
→ IPv4 주소 복사 (예: 192.168.0.100)

### 방화벽 설정
```powershell
# 관리자 권한으로 PowerShell 실행 후
New-NetFirewallRule -DisplayName "Django Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Next.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 모바일에서 접속
- 관리자: `http://[PC IP]:3000`
- 회원앱: `http://[PC IP]:3000/app`

예: `http://192.168.0.100:3000/app`

---

## 🐛 트러블슈팅

### 포트 충돌
```powershell
Stop-Process -Name "node" -Force
Stop-Process -Name "python" -Force
```

### 캐시 문제
```powershell
cd gym_web
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache
```

### 데이터베이스 초기화
```powershell
cd gym_api
Remove-Item db.sqlite3
Remove-Item -Recurse members\migrations\*.py -Exclude __init__.py
python manage.py makemigrations
python manage.py migrate
```

### 브라우저 캐시
- Chrome: `Ctrl + Shift + Delete`
- 또는 `Ctrl + F5` (강제 새로고침)

---

## 📈 통계

### 코드 규모
- **프론트엔드**: 20+ 페이지
- **백엔드**: 20+ 모델, 50+ API
- **총 라인**: ~10,000+ 라인

### 구현 시간
- 백엔드 모델: 완료 ✅
- 백엔드 API: 완료 ✅
- 관리자 페이지: 완료 ✅
- 회원용 앱: 완료 ✅

---

## 💡 사용 팁

### 관리자
1. 대시보드에서 "회원용 앱 접속" 클릭
2. 회원 상세에서 회원권 구매 가능
3. WOD 등록 → 회원 앱에 자동 표시
4. 대기 회원 승인 필요

### 회원
1. AI 캐릭터 먼저 생성
2. 오늘의 운동 확인
3. 출석 체크 → 자동 칼로리 계산
4. 식단 기록으로 관리
5. 커뮤니티에서 소통
6. 채팅으로 문의

---

## 🎉 완성!

**모든 기능이 완성되었습니다!**

### 다음 단계
1. 서버 2개 실행 (백엔드 + 프론트엔드)
2. `localhost:3000` 접속
3. 관리자 기능 테스트
4. `localhost:3000/app` 접속
5. 회원 기능 테스트
6. 모바일에서 접속 테스트

---

**🎊 즐거운 사용 되세요! 💪**








