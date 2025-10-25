# 📱 React Native 앱 생성 가이드

## 🎯 개요

Next.js 웹을 React Native 앱으로 변환하는 것은 불가능합니다. 대신 **Expo**를 사용하여 새로운 React Native 앱을 생성하고, 기존 API를 연동합니다.

## ⚡ 빠른 시작 (권장)

### 1단계: Expo 앱 생성

```bash
cd C:\Users\guddn\Downloads\COCO
npx create-expo-app pumpy-mobile --template blank-typescript
cd pumpy-mobile
```

### 2단계: 필요한 패키지 설치

```bash
npm install axios @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npx expo install expo-image-picker expo-secure-store
```

### 3단계: 앱 아이콘 및 이름 설정

**app.json 수정:**
```json
{
  "expo": {
    "name": "펌피",
    "slug": "pumpy-mobile",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#667eea"
    },
    "android": {
      "package": "com.pumpy.gym",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#667eea"
      }
    },
    "ios": {
      "bundleIdentifier": "com.pumpy.gym",
      "buildNumber": "1.0.0"
    }
  }
}
```

## 📁 프로젝트 구조

```
pumpy-mobile/
├── App.tsx                 # 메인 앱
├── app.json               # 앱 설정
├── assets/
│   ├── icon.png          # 앱 아이콘 (1024x1024)
│   ├── splash.png        # 스플래시 화면
│   └── adaptive-icon.png # Android 아이콘
├── screens/              # 화면들
│   ├── HomeScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── CommunityScreen.tsx
│   └── LoginScreen.tsx
├── components/           # 컴포넌트들
│   └── BottomNav.tsx
└── services/
    └── api.ts           # API 연동
```

## 🎨 아이콘 생성

### 자동 생성 (권장)

```bash
# icon-generator.js 파일 생성 후
node icon-generator.js
```

**icon-generator.js:**
```javascript
const sharp = require('sharp');
const fs = require('fs');

// SVG를 PNG로 변환
const generateIcons = async () => {
  const sizes = [
    { size: 1024, name: 'icon.png' },
    { size: 1024, name: 'adaptive-icon.png' },
    { size: 1242, name: 'splash.png' }
  ];

  for (const { size, name } of sizes) {
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 102, g: 126, b: 234, alpha: 1 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="${size}" height="${size}">
          <rect width="${size}" height="${size}" fill="#667eea"/>
          <path d="M ${size/2} ${size/4} L ${size*3/4} ${size*3/4} L ${size/4} ${size*3/4} Z" fill="#fff"/>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .png()
    .toFile(`assets/${name}`);
    
    console.log(`✅ ${name} 생성 완료`);
  }
};

generateIcons();
```

## 🔗 API 연동

**services/api.ts:**
```typescript
import axios from 'axios';

// AWS API URL (배포 후 변경)
const API_BASE_URL = 'http://3.27.28.175/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 함수들
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  
  register: (data: any) =>
    api.post('/members/', data),
};

export const memberAPI = {
  getProfile: (id: number) =>
    api.get(`/members/${id}/`),
  
  updateProfile: (id: number, data: any) =>
    api.patch(`/members/${id}/`, data),
};

export const membershipAPI = {
  getPlans: () =>
    api.get('/membership-plans/'),
  
  subscribe: (data: any) =>
    api.post('/subscriptions/', data),
};
```

## 📱 APK 빌드

### 1. EAS Build 설정

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 2. APK 빌드

```bash
eas build -p android --profile preview
```

### 3. 로컬 APK 빌드 (빠름)

```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

생성된 APK: `android/app/build/outputs/apk/release/app-release.apk`

## ⏱️ 예상 시간

- 앱 생성: 5분
- 패키지 설치: 5분
- 화면 개발: 30분
- API 연동: 15분
- 아이콘 생성: 5분
- APK 빌드: 15-20분

**총 예상 시간: 약 1시간 15분**

## 🚨 중요 사항

1. **Next.js는 웹 전용**이므로 React Native로 "변환" 불가
2. React Native는 **별도의 프로젝트**로 생성해야 함
3. **API 연동**으로 백엔드와 통신
4. **Expo**를 사용하면 iOS/Android 동시 개발 가능

## 📞 다음 단계

1. ✅ Expo 앱 생성
2. ✅ 아이콘 설정
3. ✅ 화면 개발
4. ✅ API 연동
5. ✅ APK 빌드
6. ✅ 테스트

준비되면 다음 명령어를 실행하세요!


