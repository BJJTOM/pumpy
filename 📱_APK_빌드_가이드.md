# 📱 APK 빌드 완료 가이드

## ✅ 완료된 작업

### 1. GitHub 푸시 ✅
- 모든 변경사항 커밋 완료
- Repository: https://github.com/BJJTOM/pumpy.git

### 2. AWS 배포 스크립트 생성 ✅
- 파일: `🚀_AWS_배포_스크립트.sh`
- 사용법:
```bash
# AWS EC2 서버에 SSH 접속
ssh -i your-key.pem ubuntu@3.27.28.175

# 스크립트 실행
cd pumpy
chmod +x 🚀_AWS_배포_스크립트.sh
./🚀_AWS_배포_스크립트.sh
```

### 3. React Native 앱 생성 ✅
- 앱 이름: **펌피**
- 패키지명: `com.pumpy.gym`
- 프레임워크: Expo (React Native)
- TypeScript 사용
- 아이콘: 파란색 X 디자인

### 4. API 연동 완료 ✅
- 백엔드 URL: `http://3.27.28.175/api`
- 인증, 회원, 회원권, 커뮤니티 API 연동
- 로그인/로그아웃 기능
- AsyncStorage 사용

### 5. 앱 아이콘 설정 ✅
- 앱 아이콘: 1024x1024
- Splash 스크린: 1242x1242
- Adaptive 아이콘: Android용
- Favicon: 48x48

## 🚀 APK 빌드 방법

### 방법 1: EAS Build (권장 - 클라우드)

```bash
cd pumpy-app

# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# 빌드 설정
eas build:configure

# APK 빌드
eas build -p android --profile preview
```

**예상 시간:** 15-20분
**다운로드:** EAS 대시보드에서 APK 다운로드

### 방법 2: 로컬 빌드 (빠름)

```bash
cd pumpy-app

# Android 프로젝트 생성
npx expo prebuild

# Android Studio에서 빌드
cd android
./gradlew assembleRelease

# 또는 Windows에서:
gradlew.bat assembleRelease
```

**APK 위치:** `android/app/build/outputs/apk/release/app-release.apk`

### 방법 3: Expo Go로 테스트 (가장 빠름)

```bash
cd pumpy-app

# 개발 서버 시작
npx expo start

# QR 코드로 Expo Go 앱에서 스캔
```

## 📊 현재 상태

```
✅ Git 커밋 & GitHub 푸시
✅ AWS 배포 스크립트 생성
✅ React Native 앱 생성
✅ API 연동
✅ 앱 아이콘 설정
🔄 APK 빌드 준비 완료
```

## 🎯 다음 단계

### 즉시 테스트하기
```bash
cd C:\Users\guddn\Downloads\COCO\pumpy-app
npx expo start
```

그 다음:
1. 스마트폰에 "Expo Go" 앱 설치
2. QR 코드 스캔
3. 앱 테스트

### APK 배포하기
```bash
# EAS Build로 APK 생성
cd pumpy-app
eas build -p android --profile preview

# 빌드 완료 후 APK 다운로드
# https://expo.dev/accounts/[your-account]/projects/pumpy-app/builds
```

## 📱 앱 정보

- **이름:** 펌피
- **패키지명:** com.pumpy.gym
- **버전:** 1.0.0
- **아이콘:** 파란색 X (그리드 배경)
- **백엔드:** http://3.27.28.175/api

## ⚡ 빠른 명령어

```bash
# 앱 시작 (개발)
cd pumpy-app && npx expo start

# APK 빌드 (클라우드)
cd pumpy-app && eas build -p android

# 로컬 APK 빌드
cd pumpy-app && npx expo prebuild && cd android && ./gradlew assembleRelease
```

## 🔧 문제 해결

### "eas command not found"
```bash
npm install -g eas-cli
```

### "Java 버전 오류"
```bash
# JDK 17 설치 필요
# https://adoptium.net/
```

### "Android SDK 없음"
```bash
# Android Studio 설치
# https://developer.android.com/studio
```

## 📞 지원

문제 발생 시:
1. `npx expo doctor` 실행
2. `npm install` 재실행
3. 캐시 삭제: `npx expo start -c`

## 🎉 완료!

모든 코드가 준비되었습니다!

**선택하세요:**
1. **즉시 테스트:** `npx expo start`
2. **APK 빌드:** `eas build -p android`
3. **AWS 배포:** SSH로 서버 접속 후 스크립트 실행

**총 소요 시간:** 
- 코드 작성: ✅ 완료
- GitHub 푸시: ✅ 완료  
- 앱 생성: ✅ 완료
- APK 빌드: 15-20분 (EAS) 또는 10-15분 (로컬)


