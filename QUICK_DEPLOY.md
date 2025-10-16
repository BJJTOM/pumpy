# ⚡ 5분 안에 웹에서 보기!

## 🎯 목표
로컬 서버를 인터넷에서 접속 가능하게 만들기

---

## 방법 1: Ngrok (가장 빠름! ⚡)

### 1단계: Ngrok 다운로드
1. https://ngrok.com/download 접속
2. Windows 버전 다운로드
3. 다운로드한 파일 압축 해제
4. `ngrok.exe`를 `C:\ngrok\` 폴더에 복사

### 2단계: 회원가입 (무료)
1. https://dashboard.ngrok.com/signup 에서 무료 가입
2. Auth Token 복사
3. PowerShell에서 실행:
```powershell
C:\ngrok\ngrok.exe authtoken [복사한토큰]
```

### 3단계: 백엔드 터널 생성
```powershell
C:\ngrok\ngrok.exe http 8000
```

생성된 URL 복사 (예: `https://abc123.ngrok-free.app`)

### 4단계: 프론트엔드 환경 변수 업데이트
```powershell
cd C:\Users\guddn\Downloads\COCO\gym_web
$env:NEXT_PUBLIC_API_BASE="https://abc123.ngrok-free.app/api"
npm run dev
```

### 5단계: 프론트엔드 터널 생성 (새 PowerShell 창)
```powershell
C:\ngrok\ngrok.exe http 3000
```

생성된 URL 복사 (예: `https://xyz789.ngrok-free.app`)

### ✅ 완료!
이제 누구나 접속 가능:
- **관리자**: `https://xyz789.ngrok-free.app`
- **회원 앱**: `https://xyz789.ngrok-free.app/app`

---

## 방법 2: Cloudflare Tunnel (무료, 더 안정적)

### 1단계: Cloudflared 다운로드
1. https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
2. Windows 버전 다운로드
3. 설치

### 2단계: 백엔드 터널
```powershell
cloudflared tunnel --url http://localhost:8000
```

### 3단계: 프론트엔드 터널
```powershell
cloudflared tunnel --url http://localhost:3000
```

---

## 방법 3: LocalTunnel (가장 쉬움!)

### 1단계: 설치
```powershell
npm install -g localtunnel
```

### 2단계: 백엔드 터널
```powershell
lt --port 8000
```

### 3단계: 프론트엔드 터널
```powershell
lt --port 3000
```

---

## 🎯 추천 순서

1. **LocalTunnel** (npm 있으면 바로 가능)
2. **Ngrok** (가장 안정적)
3. **Cloudflare** (프로페셔널)

---

## 📱 친구에게 공유하기

1. 생성된 URL 복사
2. 카카오톡, SMS 등으로 공유
3. 누구나 접속 가능!

---

## ⚠️ 주의사항

- **무료 버전 제한**:
  - Ngrok: 동시 2개 터널, 세션당 8시간
  - LocalTunnel: 무제한이지만 불안정
  - Cloudflare: 무제한, 가장 안정적

- **보안**:
  - 민감한 데이터는 주의
  - 테스트용으로만 사용
  - 사용 후 터널 종료

---

## 🚀 바로 시작하기

### LocalTunnel로 시작 (가장 빠름!)

```powershell
# 1. LocalTunnel 설치
npm install -g localtunnel

# 2. 백엔드 터널 (새 PowerShell 창)
cd C:\Users\guddn\Downloads\COCO\gym_api
.\.venv\Scripts\python manage.py runserver 8000
# 다른 창에서:
lt --port 8000

# 3. 생성된 백엔드 URL 복사 (예: https://abc-123.loca.lt)

# 4. 프론트엔드 시작 (새 PowerShell 창)
cd C:\Users\guddn\Downloads\COCO\gym_web
$env:NEXT_PUBLIC_API_BASE="https://abc-123.loca.lt/api"
npm run dev
# 다른 창에서:
lt --port 3000

# 5. 생성된 프론트엔드 URL 접속!
```

---

## 💡 Tip

LocalTunnel 첫 접속 시 보안 화면 나오면:
1. "Continue" 클릭
2. 나오는 IP 주소 입력
3. "Submit" 클릭

---

## 🎉 완료!

이제 전세계 어디서나 접속 가능합니다!

**URL을 저에게 보여주시면 함께 확인해볼게요!** 🚀



