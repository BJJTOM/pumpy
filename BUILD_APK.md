# Pumpy APK 빌드 가이드

## 사전 준비
- ✅ InfoScreen.tsx 생성 완료
- ✅ AppNavigator.tsx 업데이트 완료 (5개 탭)
- ✅ AWS 웹 서버 업데이트 완료

## APK 빌드 단계

### Step 1: 의존성 설치 확인

```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp
npm install
```

### Step 2: Android 빌드

```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android
.\gradlew clean
.\gradlew assembleRelease
```

### Step 3: APK 확인

빌드 완료 후 APK 파일 위치:
```
C:\Users\guddn\Downloads\COCO\PumpyApp\android\app\build\outputs\apk\release\app-release.apk
```

### Step 4: APK 이름 변경 및 이동

```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android\app\build\outputs\apk\release
Copy-Item app-release.apk C:\Users\guddn\Downloads\COCO\Pumpy_Final_v3.apk
```

## 빌드 명령어 요약

```powershell
# 전체 과정을 한 번에
cd C:\Users\guddn\Downloads\COCO\PumpyApp
npm install
cd android
.\gradlew clean assembleRelease
Copy-Item app\build\outputs\apk\release\app-release.apk C:\Users\guddn\Downloads\COCO\Pumpy_Final_v3.apk
```

## 빌드 후 확인 사항

### APK 파일 크기
- 예상 크기: 약 50-70MB
- 파일이 너무 작으면 (< 20MB) 빌드 실패

### APK 설치 테스트
```powershell
# USB로 폰 연결 후
adb install C:\Users\guddn\Downloads\COCO\Pumpy_Final_v3.apk

# 또는 APK 파일을 폰으로 전송하여 직접 설치
```

### 기능 테스트 체크리스트
- [ ] 로그인
- [ ] 홈 화면 (AI 프로필, 운동 정보)
- [ ] 커뮤니티 (준비중 화면)
- [ ] 내정보 (회원권, 동의서)
- [ ] 알림 (준비중 화면)
- [ ] 프로필 (AI 캐릭터, 신체 정보)
- [ ] 로그아웃

## 문제 해결

### 빌드 실패: Gradle 에러

```powershell
# Gradle 캐시 삭제
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android
.\gradlew clean --refresh-dependencies
```

### 빌드 실패: Java 버전 에러

```powershell
# Java 17 설치 확인
java -version

# JAVA_HOME 환경 변수 설정
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

### 빌드 실패: Android SDK 에러

```powershell
# Android SDK 경로 확인
$env:ANDROID_HOME

# 또는 local.properties 확인
cat C:\Users\guddn\Downloads\COCO\PumpyApp\android\local.properties
```

### APK 설치 실패: 파싱 에러

- APK가 손상되었을 수 있음
- 빌드를 다시 시도

### 앱 실행 시 크래시

```powershell
# 로그 확인
adb logcat | Select-String "PumpyApp"
```

## 최적화 (선택사항)

### APK 크기 줄이기

```gradle
// android/app/build.gradle
android {
    buildTypes {
        release {
            enableProguard true
            enableShrinkResources true
        }
    }
}
```

### 서명된 APK 생성

```powershell
# 키스토어 생성
keytool -genkey -v -keystore pumpy-release-key.keystore -alias pumpy-key-alias -keyalg RSA -keysize 2048 -validity 10000

# gradle.properties에 추가
MYAPP_RELEASE_STORE_FILE=pumpy-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=pumpy-key-alias
MYAPP_RELEASE_STORE_PASSWORD=yourpassword
MYAPP_RELEASE_KEY_PASSWORD=yourpassword
```

## 배포

### 내부 테스트 (체육관 회원)

1. APK 파일을 공유
   - 카카오톡 단체 채팅방
   - Google Drive 링크
   - 체육관 웹사이트

2. 설치 안내 문서
   - "알 수 없는 출처" 허용 방법
   - 설치 단계 스크린샷

### Google Play Store (선택사항)

- 개발자 계정 필요 ($25 일회성)
- 앱 번들(AAB) 생성 필요
- 리뷰 시간: 1-3일

## 새 기능 추가 시

1. 코드 수정
2. 버전 업데이트
   ```json
   // package.json
   "version": "3.1.0"
   ```
3. 빌드
4. 배포

## 현재 버전 정보

- **버전**: 3.0.0
- **빌드 날짜**: 2025-10-15
- **변경사항**:
  - ✅ 내 정보 페이지 추가
  - ✅ 5개 탭 네비게이션
  - ✅ BlackShark 테마
  - ✅ AWS 서버 연동

## 다음 업데이트 계획

- 커뮤니티 기능 구현
- 알림 기능 구현
- 운동 기록 상세 화면
- 출석 체크 QR 코드


