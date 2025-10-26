# 📱 Android Studio 설치 & 에뮬레이터 연결 가이드

## 🎯 목표
코드 수정 → 저장 → 즉시 앱에 반영 (빌드 없이!)

---

## ✅ **1단계: Android Studio 다운로드 & 설치**

### 다운로드:
브라우저가 자동으로 열렸습니다!
- 페이지: https://developer.android.com/studio
- **"Download Android Studio"** 클릭
- 약 1GB 크기

### 설치 과정:
1. 다운로드한 `android-studio-xxx.exe` 실행
2. **"Next"** 클릭
3. **컴포넌트 선택**에서 모두 체크:
   - ✅ Android Studio
   - ✅ Android Virtual Device (AVD) ⬅️ **중요!**
4. **"Next"** → 설치 경로 선택 (기본값 권장)
5. **"Install"** 클릭
6. 설치 완료 후 **"Finish"** 클릭

---

## ✅ **2단계: Android Studio 초기 설정**

### 첫 실행:
1. Android Studio 실행
2. **"Do not import settings"** 선택 (첫 설치 시)
3. **"Next"** 클릭

### Setup Wizard:
1. **Install Type**: 
   - **"Standard"** 선택 ⬅️ **추천!**
   - "Next" 클릭

2. **Select UI Theme**:
   - Darcula (어두운 테마) 또는 Light (밝은 테마) 선택
   - "Next" 클릭

3. **Verify Settings**:
   - Android SDK 위치 확인 (보통 `C:\Users\[사용자]\AppData\Local\Android\Sdk`)
   - **"Finish"** 클릭

4. **Downloading Components**:
   - Android SDK, Platform-Tools, Build-Tools 등 자동 다운로드
   - 약 5-10분 소요 (인터넷 속도에 따라)
   - ☕ 커피 한잔!

5. 완료 후 **"Finish"** 클릭

---

## ✅ **3단계: SDK Manager 확인 및 설치**

### SDK Manager 열기:
1. Android Studio 메인 화면
2. **"More Actions"** → **"SDK Manager"** 클릭
   (또는 상단 메뉴: Tools → SDK Manager)

### SDK Platforms 탭:
다음 항목 체크 후 "Apply":
- ✅ **Android 14.0 (UpsideDownCake)** - API Level 34
- ✅ **Android 13.0 (Tiramisu)** - API Level 33
- ✅ **Android 12.0 (S)** - API Level 31
- ✅ **Android 11.0 (R)** - API Level 30

### SDK Tools 탭:
다음 항목 체크 후 "Apply":
- ✅ **Android SDK Build-Tools** (최신 버전)
- ✅ **Android SDK Platform-Tools**
- ✅ **Android Emulator** ⬅️ **중요!**
- ✅ **Android SDK Tools**
- ✅ **Intel x86 Emulator Accelerator (HAXM installer)** (Intel CPU인 경우)

"Apply" → "OK" → 다운로드 대기

---

## ✅ **4단계: AVD (에뮬레이터) 생성**

### Device Manager 열기:
1. Android Studio 메인 화면
2. **"More Actions"** → **"Virtual Device Manager"** 클릭
   (또는 상단 메뉴: Tools → Device Manager)

### 새 AVD 생성:
1. **"Create Device"** 클릭

2. **Select Hardware**:
   - **Category**: Phone
   - **Device**: **Pixel 6** 선택 ⬅️ **추천!**
     (또는 Pixel 5, Pixel 7 등)
   - "Next" 클릭

3. **System Image**:
   - **Release Name**: **UpsideDownCake** (Android 14.0)
   - **API Level**: 34
   - **ABI**: x86_64
   - 오른쪽 **"Download"** 클릭 (아직 다운로드 안 했으면)
   - 다운로드 완료 후 선택
   - "Next" 클릭

4. **Verify Configuration**:
   - **AVD Name**: `Pixel_6_API_34` (원하는 이름으로 변경 가능)
   - **Startup orientation**: Portrait
   - **Graphics**: Automatic (또는 Hardware - GLES 2.0)
   - "Show Advanced Settings" 클릭 (선택사항):
     - **RAM**: 2048 MB (기본값)
     - **Internal Storage**: 2048 MB
     - **SD Card**: 512 MB (선택사항)
   - **"Finish"** 클릭

---

## ✅ **5단계: 환경 변수 설정**

### ANDROID_HOME 설정:

#### 방법 1: 자동 설정 (PowerShell 스크립트 실행)
```powershell
# 나중에 자동화 스크립트 실행
```

#### 방법 2: 수동 설정
1. **Windows 검색**: "환경 변수" 입력
2. **"시스템 환경 변수 편집"** 클릭
3. **"환경 변수"** 버튼 클릭
4. **"시스템 변수"** 섹션에서:
   
   **새로 만들기**:
   - **변수 이름**: `ANDROID_HOME`
   - **변수 값**: `C:\Users\guddn\AppData\Local\Android\Sdk`
     (실제 SDK 경로로 변경)

5. **"Path"** 변수 선택 → **"편집"** 클릭
   
   **새로 만들기**로 다음 경로 추가:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

6. **"확인"** → **"확인"** → **"확인"**

7. **PowerShell 재시작** (중요!)

---

## ✅ **6단계: 에뮬레이터 실행 테스트**

### Device Manager에서 실행:
1. Android Studio → Device Manager
2. 생성한 AVD 옆의 **▶️ (Play)** 버튼 클릭
3. 에뮬레이터 창 표시 (30초~1분 소요)
4. Android 홈 화면 확인

### 커맨드라인에서 실행 (확인용):
```powershell
emulator -list-avds
# 출력: Pixel_6_API_34

emulator -avd Pixel_6_API_34
```

---

## ✅ **7단계: 펌피 앱 연결 & 테스트**

### 1. 에뮬레이터 실행 (위 6단계)

### 2. 펌피 개발 서버 시작:
```powershell
cd C:\Users\guddn\Downloads\COCO\pumpy-app
npm start
```

### 3. 에뮬레이터에 앱 설치:
터미널에서 **`a`** 키 입력
- 또는 터미널 옵션에서 "Run on Android" 선택

### 4. 앱 자동 설치 & 실행! 🎉

### 5. 코드 수정 테스트:
```typescript
// pumpy-app/src/screens/home/HomeScreen.tsx 파일 열기
// 아무 텍스트 수정
// 저장 (Ctrl+S)
// → 에뮬레이터에 즉시 반영! ⚡
```

---

## 🎯 **완료 후 개발 흐름**

### 일반적인 작업:
```powershell
# 1. 에뮬레이터 실행 (한 번만)
# Android Studio → Device Manager → Play 버튼

# 2. 개발 서버 실행
cd pumpy-app
npm start

# 3. 터미널에서 'a' 키 입력

# 4. 코드 수정 → 저장 → 즉시 반영!
```

### Hot Reload 동작:
- **UI 변경** (JSX, 스타일): < 1초 반영
- **로직 변경** (함수, State): 자동 새로고침
- **네이티브 코드 변경**: 앱 재시작 필요

---

## 🐛 **문제 해결**

### 에뮬레이터가 느린 경우:
1. **HAXM 설치 확인** (Intel CPU):
   - SDK Manager → SDK Tools → Intel x86 Emulator Accelerator
   - 또는 직접 설치: `C:\Users\guddn\AppData\Local\Android\Sdk\extras\intel\Hardware_Accelerated_Execution_Manager\intelhaxm-android.exe`

2. **Hyper-V 비활성화** (필요 시):
   ```powershell
   # 관리자 권한 PowerShell
   bcdedit /set hypervisorlaunchtype off
   # 재부팅 필요
   ```

3. **AVD RAM 증가**:
   - Device Manager → AVD 편집 → RAM 4096MB로 증가

### "adb: command not found" 오류:
```powershell
# 환경 변수 확인
$env:ANDROID_HOME
$env:PATH

# adb 실행 테스트
adb devices
```

### Metro 번들러 오류:
```powershell
cd pumpy-app
npm start -- --reset-cache
```

---

## 📊 **시간 소요**

- Android Studio 다운로드: 5-10분
- Android Studio 설치: 5분
- SDK 다운로드: 10-20분
- AVD 생성: 5분
- 환경 변수 설정: 2분
- 첫 에뮬레이터 실행: 2분
- 앱 빌드 & 설치: 1-2분

**총 소요 시간**: 약 30-45분

---

## ✅ **설치 완료 체크리스트**

- [ ] Android Studio 설치
- [ ] SDK Manager에서 필수 컴포넌트 설치
- [ ] AVD (에뮬레이터) 생성
- [ ] 환경 변수 설정 (ANDROID_HOME, PATH)
- [ ] 에뮬레이터 정상 실행
- [ ] `adb devices` 명령어 동작
- [ ] `npm start` 후 'a' 키로 앱 실행
- [ ] 코드 수정 후 Hot Reload 확인

---

## 🎉 **완료 후**

에뮬레이터가 실행되면 알려주세요!
자동으로 앱을 설치하고 테스트하겠습니다! 🚀

---

## 📞 **다음 단계**

1. 위 가이드대로 설치 진행
2. 에뮬레이터 실행 성공 시 알려주세요
3. 자동으로 펌피 앱 연결 & 테스트!

**설치 중 문제가 발생하면 언제든 말씀해주세요!** 😊

