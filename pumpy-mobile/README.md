# 펌피 모바일 앱 (React Native)

관리자 페이지와 회원 신청 기능이 포함된 네이티브 앱

## 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 시작
npx expo start

# 3. 스캔 또는 Android 에뮬레이터에서 실행
# - Expo Go 앱 설치
# - QR 코드 스캔
# 또는
# - 'a' 키를 눌러 Android 에뮬레이터에서 실행
```

## APK 빌드

```bash
# EAS Build 사용
npx eas build --platform android --profile preview

# 또는 로컬 빌드
npx expo prebuild
cd android
./gradlew assembleRelease
```

## 기능

- ✅ 대시보드
- ✅ 회원 관리
- ✅ 회원 신청
- ✅ 승인 대기
- ✅ 출석 관리
- ✅ 일정 관리










