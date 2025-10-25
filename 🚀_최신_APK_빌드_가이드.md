# 🚀 최신 APK 빌드 가이드 (v2.0.0)

## ✨ 업데이트 내용

### 버전 2.0.0 (2025-10-25)

**🎯 WebView 기반 하이브리드 앱으로 전환!**

이제 APK가 실제 웹앱(`http://3.27.28.175/app`)을 로드하므로,  
**지금까지 개발한 모든 최신 기능**이 자동으로 포함됩니다!

---

## 📱 포함된 기능 (Full Features)

### 🏠 홈 화면
- ✅ **복싱 캐릭터** 메인 디스플레이
- ✅ **AI 캐릭터 편집** 기능 (사진 업로드 → AI 변환)
- ✅ **레벨 & 경험치** 시스템
- ✅ **Today's Steps** (오늘 걸음 수)
- ✅ **출석 통계** 달성률
- ✅ **신체 정보** (체중, 키, BMI)
- ✅ **WOD** (Workout of the Day)

### 👤 프로필 화면
- ✅ **게임 스타일 내 방** 배경 (5종류)
- ✅ **캐릭터 커스터마이징**
- ✅ **칭호 & 뱃지** 시스템
- ✅ **레벨 & 경험치 바**
- ✅ **내 체육관 등록 정보**
  - 회원 정보
  - 현재 회원권 상태
  - 약관 동의 내역
- ✅ **프리미엄 구독** (AI 기능 포함)
- ✅ **설정**
  - 알림 설정
  - 개인정보 및 보안
  - 버전 정보
- ✅ **고객지원**
  - 공지사항
  - 자주 묻는 질문
  - 1:1 문의
- ✅ **정보**
  - 이용약관
  - 개인정보 처리방침
  - 오픈소스 라이선스

### 💬 커뮤니티
- ✅ **게시글 작성/수정/삭제**
- ✅ **댓글 작성**
- ✅ **좋아요** (실시간 카운트)
- ✅ **조회수** 자동 증가
- ✅ **카테고리** 필터링
- ✅ **이미지 업로드**
- ✅ **스토리** (24시간 제한)

### 💳 회원권 & 결제
- ✅ **회원권 플랜** 선택
- ✅ **가상 결제** (카드/계좌이체/현금)
- ✅ **실시간 승인** (즉시 활성화)
- ✅ **매출 대시보드 연동**
- ✅ **회원권 상태** 실시간 확인

### 🏋️ 운동 관리
- ✅ **출석 체크**
- ✅ **운동 기록**
- ✅ **식단 관리**
- ✅ **신체 정보 추적**

---

## 🛠️ 기술 스택

- **프레임워크**: React Native (Expo)
- **렌더링**: WebView (최신 웹앱 로드)
- **백엔드**: Django REST + PostgreSQL
- **프론트엔드**: Next.js 15
- **서버**: AWS EC2 (3.27.28.175)
- **배포**: Nginx + Gunicorn + PM2

---

## 📦 APK 빌드 과정

### 현재 빌드 중...

```bash
cd pumpy-app/android
gradlew.bat assembleRelease
```

**예상 시간**: 8-12분  
**완료 후 위치**: `pumpy-app/android/app/build/outputs/apk/release/app-release.apk`

---

## 🎉 빌드 완료 후

### APK 설치 및 테스트

1. **APK 파일 확인**
   ```
   위치: pumpy-app/android/app/build/outputs/apk/release/
   파일명: app-release.apk
   크기: ~50-70 MB
   ```

2. **Android 기기에 설치**
   - USB 연결 → 파일 전송
   - 또는 Google Drive/이메일로 전송
   - "알 수 없는 출처" 허용 필요

3. **앱 실행**
   - WiFi/데이터 연결 필수
   - 서버 URL: `http://3.27.28.175/app`
   - 로그인 후 모든 기능 사용 가능

---

## 🔧 로컬 테스트 (개발 모드)

```bash
cd pumpy-app
npx expo start
```

- Expo Go 앱에서 QR 코드 스캔
- 개발 환경에서는 `http://localhost:3000/app` 로드
- 프로덕션 환경에서는 `http://3.27.28.175/app` 로드

---

## 🌐 배포 후 자동 업데이트

**WebView 기반의 장점:**
- 웹 서버(`gym_web`)에 새 기능 배포 시
- **APK 재빌드 없이** 자동으로 최신 버전 표시
- 사용자가 앱을 재설치할 필요 없음

---

## ✅ 체크리스트

- [x] WebView 패키지 설치
- [x] App.tsx 업데이트 (WebView 기반)
- [x] 버전 업데이트 (2.0.0)
- [🔄] APK 빌드 진행 중...
- [ ] APK 테스트
- [ ] APK 전달

---

## 📞 문제 발생 시

### 앱이 로드되지 않음
- 인터넷 연결 확인
- 서버 상태 확인: `http://3.27.28.175/app`
- AWS 서버 가동 확인

### 빌드 에러
```bash
# Android SDK 경로 확인
echo $env:ANDROID_HOME
# 또는
C:\Users\guddn\AppData\Local\Android\Sdk

# local.properties 확인
cat pumpy-app/android/local.properties
```

### Gradle 빌드 실패
```bash
# 캐시 삭제 후 재시도
cd pumpy-app/android
.\gradlew.bat clean
.\gradlew.bat assembleRelease
```

---

## 🎊 완료!

빌드가 완료되면 `Pumpy_v2.0.0.apk`가 생성됩니다.  
모든 최신 기능이 포함된 앱을 즐기세요! 🥊

---

**최종 업데이트**: 2025-10-25  
**버전**: 2.0.0  
**개발자**: Pumpy Team


