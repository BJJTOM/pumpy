# 🔥 APK 빌드 긴급 가이드

## 📌 현재 상황

### ✅ 완료된 작업
1. ✅ HomeScreen.tsx 업데이트 완료
2. ✅ InfoScreen.tsx 업데이트 완료  
3. ✅ 웹 정상 작동 (로컬 & AWS)

### ❌ 문제
- 업데이트된 코드가 기존 APK에 반영되지 않음
- 새로 빌드해야 함
- **Java가 설치되지 않아 빌드 불가**

---

## ⚡ 빠른 해결 방법 (3가지 옵션)

### 옵션 1: Java 설치 후 빌드 (권장, 10분)

#### Step 1: Java 17 다운로드 및 설치
**다운로드**: https://adoptium.net/temurin/releases/?version=17

1. 위 링크 접속
2. **Windows x64 JDK** 다운로드 (`.msi` 파일)
3. 설치 실행
4. ✅ "Set JAVA_HOME variable" 체크 (중요!)
5. 설치 완료

#### Step 2: 설치 확인
```powershell
# 새 PowerShell 창 열기
java -version

# 출력 예시:
# openjdk version "17.0.9"
```

#### Step 3: APK 빌드
```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android

# Clean
.\gradlew clean

# Build
.\gradlew assembleRelease

# 결과 파일:
# app\build\outputs\apk\release\app-release.apk
```

#### Step 4: APK 복사
```powershell
Copy-Item app\build\outputs\apk\release\app-release.apk C:\Users\guddn\Downloads\COCO\Pumpy_Updated_v3.1.apk
```

---

### 옵션 2: Android Studio 사용 (20분)

이미 Android Studio가 설치되어 있다면:

#### Step 1: Android Studio 실행
1. Android Studio 실행
2. Open → `C:\Users\guddn\Downloads\COCO\PumpyApp\android` 선택
3. Gradle Sync 완료 대기

#### Step 2: 빌드
1. Build → Generate Signed Bundle / APK
2. APK 선택 → Next
3. Release 선택 → Finish
4. 빌드 완료 대기 (5-10분)

#### Step 3: APK 확인
```
위치: PumpyApp/android/app/build/outputs/apk/release/app-release.apk
```

---

### 옵션 3: 온라인 빌드 서비스 (30분)

GitHub Actions 또는 Expo EAS Build 사용 (복잡함, 비추천)

---

## 🎯 추천: 옵션 1 (Java 설치)

**이유**:
- 가장 빠름 (10분)
- 향후 빌드에도 필요
- 한 번만 설치하면 됨

**단계별 실행**:

### 1️⃣ Java 다운로드 (2분)
```
https://adoptium.net/temurin/releases/?version=17

→ Windows x64 JDK (.msi)
→ 다운로드
```

### 2️⃣ Java 설치 (3분)
```
1. .msi 파일 실행
2. Next → Next
3. ✅ Set JAVA_HOME variable 체크!
4. Install
5. Finish
```

### 3️⃣ 확인 (1분)
```powershell
# 새 PowerShell 창
java -version

# 성공:
openjdk version "17.0.9"
```

### 4️⃣ APK 빌드 (5분)
```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android
.\gradlew clean
.\gradlew assembleRelease
```

### 5️⃣ APK 복사
```powershell
Copy-Item app\build\outputs\apk\release\app-release.apk C:\Users\guddn\Downloads\COCO\Pumpy_Updated_v3.1.apk
```

---

## 📋 업데이트된 기능 (반영 예정)

### HomeScreen (앱 홈 화면)

#### 새로 추가된 UI
```
┌─────────────────────────────┐
│ [날짜 표시]                 │
├─────────────────────────────┤
│ [AI 캐릭터 이미지]          │
│ 홍길동님                    │
├─────────────────────────────┤
│ 💪 신체 정보                │
│ 체중 | 근육 | 체지방 | BMI │
│ 상태: 정상                  │
├─────────────────────────────┤
│ 🥊 블랙샤크 본관            │
├─────────────────────────────┤
│ 📋 오늘의 운동              │
│ [WOD 내용]                  │
│ [완료하기 버튼]             │
├─────────────────────────────┤
│ 📊 출석 통계    [상세]     │
│ 연속 | 이번달 | 총          │
├─────────────────────────────┤
│ 💪 운동 내역  [상세보기]   │
│ TODAY 스쿼트 🔥 490kcal    │
└─────────────────────────────┘
```

#### 새 기능
- ✅ 출석 통계 실시간 계산
- ✅ 중복 날짜 제거
- ✅ 연속 출석일 정확한 계산
- ✅ 이번 달 출석일 정확한 계산
- ✅ 운동 상세 정보 표시
- ✅ 30초 자동 새로고침

---

## 🔍 빌드 전후 비교

### 기존 APK (Pumpy_Final_v3.0.apk)
```
❌ 출석 통계 부정확
❌ 운동 상세 정보 없음
❌ 블랙샤크 본관 정보 없음
❌ 신체 정보 BMI 계산 없음
```

### 새 APK (빌드 후)
```
✅ 출석 통계 정확
✅ 운동 상세 정보 (세트, 회수, 칼로리)
✅ 블랙샤크 본관 정보 표시
✅ 신체 정보 BMI 계산 및 상태
✅ 30초 자동 새로고침
```

---

## 🐛 문제 해결

### Java 설치 후에도 빌드 실패

#### 문제 1: JAVA_HOME not set
```powershell
# 수동 설정
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot"

# 확인
echo $env:JAVA_HOME
```

#### 문제 2: Gradle 버전 오류
```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android
.\gradlew wrapper --gradle-version=8.3
```

#### 문제 3: Android SDK 오류
```
local.properties 파일 확인:
sdk.dir=C\:\\Users\\guddn\\AppData\\Local\\Android\\Sdk
```

### 빌드 시간이 너무 오래 걸림

**정상**:
- 첫 빌드: 5-10분
- 이후 빌드: 2-5분

**느릴 때**:
```powershell
# Gradle 캐시 삭제
.\gradlew clean --refresh-dependencies
```

---

## ✅ 빌드 완료 후 확인 사항

### 1. APK 파일 확인
```powershell
Get-Item C:\Users\guddn\Downloads\COCO\Pumpy_Updated_v3.1.apk

# 크기: 약 55-60MB
# 생성 날짜: 오늘
```

### 2. 테스트 설치
```powershell
adb install C:\Users\guddn\Downloads\COCO\Pumpy_Updated_v3.1.apk
```

### 3. 앱 실행 및 확인
- [ ] 로그인 정상
- [ ] 홈 화면 새 UI 표시
- [ ] AI 캐릭터 표시
- [ ] 신체 정보 + BMI 표시
- [ ] 블랙샤크 본관 표시
- [ ] 출석 통계 정확
- [ ] 운동 상세보기 작동

---

## 📊 코드 변경 사항

### HomeScreen.tsx (638줄)

#### 주요 변경
```typescript
// 1. 출석 통계 계산 개선
const calculateConsecutiveDays = (attendance) => {
  // 중복 날짜 제거
  const uniqueDates = Array.from(new Set(...))
  // 오늘/어제 체크
  // 연속일 계산
}

const calculateThisMonthAttendance = (attendance) => {
  // 중복 제거
  const uniqueDates = new Set(...)
  return uniqueDates.size
}

// 2. 새 UI 컴포넌트
<LinearGradient> // 헤더
<View> // AI 캐릭터 카드
<View> // 신체 정보 (BMI 포함)
<LinearGradient> // 블랙샤크 본관
<View> // 오늘의 운동
<View> // 출석 통계 (상세보기)
<View> // 운동 내역 (상세보기)
```

#### 스타일 변경
```typescript
// BlackShark 테마
colors: ['#1a1a1a', '#000000'] // 체육관 카드
borderColor: '#d4af37' // 금색 테두리

// 카드 스타일
borderRadius: 20
shadowOpacity: 0.08
elevation: 5

// 글꼴
fontSize: 18 // 제목
fontWeight: '800' // 볼드
```

---

## 🚀 최종 단계

### 빌드 완료 후
1. [ ] APK 파일 확인
2. [ ] 테스트 설치
3. [ ] 기능 테스트
4. [ ] 회원 배포

### 배포 방법
```
1. 카카오톡 공유
2. Google Drive 링크
3. 웹사이트 다운로드 페이지
```

---

## 💡 꿀팁

### 빠른 빌드
```powershell
# 빌드만 (clean 없이)
.\gradlew assembleRelease

# 시간: 2-3분
```

### 버전 관리
```powershell
# 버전별 파일명
Pumpy_v3.1_[날짜].apk
Pumpy_v3.1_20251016.apk
```

### 백업
```powershell
# 기존 APK 백업
Copy-Item Pumpy_Final_v3.0.apk Pumpy_Final_v3.0_backup.apk
```

---

## 🎯 결론

**현재 해야 할 일**:

1. ✅ 코드 업데이트 완료
2. ⚠️ Java 설치 필요
3. ⏳ APK 빌드 대기
4. 📱 테스트 및 배포

**예상 시간**: **10분** (Java 설치 + 빌드)

**다음 명령**:
```powershell
# Java 설치 후
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android
.\gradlew clean assembleRelease
Copy-Item app\build\outputs\apk\release\app-release.apk C:\Users\guddn\Downloads\COCO\Pumpy_Updated_v3.1.apk
```

---

## 🥊 블랙샤크 본관 - 펌피 업데이트 준비!

**Java만 설치하면 10분 내에 새 APK 완성!** 🚀💪

---

## 📞 도움이 필요하면

1. Java 다운로드: https://adoptium.net/temurin/releases/?version=17
2. 설치 중 문제: "Set JAVA_HOME" 옵션 체크 확인
3. 빌드 오류: Gradle 캐시 삭제 후 재시도

**모든 코드는 준비되었습니다. Java만 설치하면 끝!** ✅


