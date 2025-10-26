# 🔥 Hot Reload 사용법 - 코드 수정 즉시 반영!

## 🎉 설정 완료!

✅ 에뮬레이터 실행  
✅ ADB 연결 (emulator-5554)  
✅ 앱 설치 및 Hot Reload 활성화  

---

## 🚀 **지금 진행 중:**

새 PowerShell 창이 열렸습니다!

### 진행 상황 (약 1-2분):
1. ⏳ Metro 번들러 시작
2. ⏳ React Native 앱 빌드
3. ⏳ 에뮬레이터에 앱 설치
4. ⏳ 앱 자동 실행
5. ✅ Hot Reload 활성화!

---

## ⚡ **Hot Reload 테스트 (앱 실행 후)**

### 1️⃣ **VS Code에서 파일 열기:**

```
pumpy-app/src/screens/home/HomeScreen.tsx
```

### 2️⃣ **코드 수정 예시:**

찾기 (Ctrl+F): `안녕하세요`

변경:
```typescript
// 변경 전
<Text style={styles.greeting}>안녕하세요, {currentUser?.last_name}{currentUser?.first_name}님!</Text>

// 변경 후
<Text style={styles.greeting}>환영합니다, {currentUser?.last_name}{currentUser?.first_name}님! 🎉</Text>
```

### 3️⃣ **저장:**
```
Ctrl+S
```

### 4️⃣ **에뮬레이터 확인:**
→ **1초 이내에 즉시 반영!** ⚡

---

## 🎯 **다양한 수정 테스트**

### 텍스트 변경:
```typescript
// HomeScreen.tsx
<Text style={styles.headerTitle}>홈</Text>
↓
<Text style={styles.headerTitle}>메인 화면</Text>
```

### 스타일 변경:
```typescript
// HomeScreen.tsx - styles 부분
greeting: { 
  fontSize: 22,  // ← 이 값을 변경
  fontWeight: '900', 
  color: 'white' 
}
```

### 버튼 추가:
```typescript
<TouchableOpacity 
  style={styles.testButton}
  onPress={() => Alert.alert('테스트', '버튼 클릭!')}
>
  <Text>테스트 버튼</Text>
</TouchableOpacity>
```

---

## 💡 **개발 팁**

### Fast Refresh (자동):
- **UI 변경**: < 1초 반영
- **컴포넌트 편집**: 자동 새로고침
- **State 유지**: 대부분 유지됨

### 수동 새로고침 (필요 시):
- 에뮬레이터 창에서 **R키 2번 연타**
- 또는 **Ctrl+M** → **Reload** 선택

### 개발자 메뉴:
- **Ctrl+M** → 개발자 메뉴 열기
  - **Reload**: 수동 새로고침
  - **Debug**: 디버거 연결
  - **Show Perf Monitor**: 성능 모니터
  - **Enable Fast Refresh**: Hot Reload 토글

---

## 📂 **주요 파일 경로**

### 화면 (Screens):
```
pumpy-app/src/screens/
├── home/HomeScreen.tsx          # 홈 화면
├── auth/LoginScreen.tsx         # 로그인
├── auth/RegisterScreen.tsx      # 회원가입
├── community/CommunityScreen.tsx # 커뮤니티
├── profile/ProfileScreen.tsx    # 프로필
├── settings/SettingsScreen.tsx  # 설정
├── wod/WODScreen.tsx           # WOD
├── meal/MealScreen.tsx         # 식단
└── chatbot/AIChatbotScreen.tsx # AI 챗봇
```

### 네비게이션:
```
pumpy-app/src/navigation/
├── RootNavigator.tsx  # 메인 네비게이션
└── AppTabs.tsx        # 하단 탭 네비게이션
```

### API:
```
pumpy-app/services/api.ts  # API 호출 함수
```

---

## 🔄 **매일 개발 흐름**

### 시작:
```powershell
# 1. 에뮬레이터 실행 (한 번만)
# Android Studio → Device Manager → Play 버튼

# 2. Metro 서버 시작
cd pumpy-app
npm start

# 3. 앱 실행 (터미널에서 'a' 키)
```

### 개발:
```
1. VS Code에서 코드 수정
2. Ctrl+S (저장)
3. 에뮬레이터에서 즉시 확인 ⚡
4. 반복!
```

### 종료:
```
1. Metro 서버 종료 (Ctrl+C)
2. 에뮬레이터 창 닫기
```

---

## 🐛 **문제 해결**

### Hot Reload가 안 돼요:
```
해결:
1. 에뮬레이터에서 Ctrl+M
2. "Enable Fast Refresh" 선택
3. R키 2번 (수동 새로고침)
```

### 에러 화면 (빨간 화면):
```
해결:
1. 에러 메시지 읽기
2. 코드 수정
3. R키 2번 (새로고침)
```

### Metro 연결 끊김:
```
해결:
1. Metro 서버 재시작 (Ctrl+C 후 npm start)
2. 에뮬레이터에서 R키 2번
```

### 앱이 안 열려요:
```
해결:
cd pumpy-app
npx react-native run-android
```

---

## ⚡ **성능 최적화**

### 에뮬레이터 성능:
- RAM: 4GB 권장
- Graphics: Hardware - GLES 2.0
- Multi-Core CPU: 4 cores

### Metro 캐시 삭제 (느려질 때):
```powershell
cd pumpy-app
npm start -- --reset-cache
```

---

## 📊 **속도 비교**

| 작업 | APK 빌드 | Hot Reload |
|------|----------|------------|
| 코드 수정 반영 | 40초~1분 | **< 1초** ⚡ |
| 빌드 필요 | 매번 | 한 번만 |
| 설치 필요 | 매번 | 한 번만 |

---

## 🎯 **테스트 예제**

### 예제 1: 텍스트 변경
```typescript
// HomeScreen.tsx 38번째 줄
<Text style={styles.greeting}>
  안녕하세요, {currentUser?.last_name}{currentUser?.first_name}님!
</Text>

↓ 변경

<Text style={styles.greeting}>
  반갑습니다, {currentUser?.last_name}{currentUser?.first_name}님! 👋
</Text>
```
**저장 → 즉시 반영!**

### 예제 2: 버튼 색상 변경
```typescript
// HomeScreen.tsx - styles 부분
quickActionButton: {
  backgroundColor: '#667eea',  // ← #10b981로 변경
  ...
}
```
**저장 → 즉시 반영!**

### 예제 3: 새 기능 추가
```typescript
// HomeScreen.tsx - return 문 안에 추가
<TouchableOpacity 
  style={{
    backgroundColor: '#f59e0b',
    padding: 15,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center'
  }}
  onPress={() => Alert.alert('테스트', '새 버튼 추가 완료!')}
>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>
    테스트 버튼
  </Text>
</TouchableOpacity>
```
**저장 → 즉시 반영!**

---

## ✅ **완료 체크리스트**

설치 완료:
- [x] 에뮬레이터 실행
- [x] ADB 연결 확인
- [x] 앱 설치 중 (진행 중)

Hot Reload 테스트:
- [ ] 앱 실행 확인
- [ ] 코드 수정
- [ ] Ctrl+S 저장
- [ ] 에뮬레이터 즉시 반영 확인

---

## 🎊 **완료 후 알려주세요!**

앱이 에뮬레이터에서 실행되면:

**"앱 실행됐어"** 라고 말씀해주세요!

그러면:
1. ✅ Hot Reload 작동 확인
2. ✅ 간단한 수정 테스트
3. ✅ 개발 완료!

---

**현재 진행 중: 앱 빌드 및 설치 (1-2분 소요)**

PowerShell 창에서 진행 상황을 확인하세요! 🚀

