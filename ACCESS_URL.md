# 🌐 인터넷 접속 URL

## ✅ 완료! 터널이 생성되었습니다!

2개의 새 PowerShell 창이 열렸고, 각각 URL이 표시됩니다:

---

## 📋 확인 방법

### 1️⃣ 백엔드 URL 확인
- 첫 번째 PowerShell 창 확인
- `your url is: https://xxxxx.loca.lt` 형식의 URL 찾기
- 이것이 **백엔드 URL**입니다

예시:
```
your url is: https://heavy-dogs-smile.loca.lt
```

### 2️⃣ 프론트엔드 URL 확인
- 두 번째 PowerShell 창 확인
- `your url is: https://yyyyy.loca.lt` 형식의 URL 찾기
- 이것이 **프론트엔드 URL**입니다

예시:
```
your url is: https://bright-foxes-jump.loca.lt
```

---

## 🔧 프론트엔드 재시작 (중요!)

백엔드 URL을 얻었으면, 프론트엔드를 재시작해야 합니다:

```powershell
# 1. 기존 Next.js 서버 중지
Stop-Process -Name "node" -Force

# 2. 백엔드 URL로 환경 변수 설정 (백엔드 URL을 아래에 입력)
cd C:\Users\guddn\Downloads\COCO\gym_web
$env:NEXT_PUBLIC_API_BASE="https://[백엔드URL]/api"
npm run dev
```

예시:
```powershell
$env:NEXT_PUBLIC_API_BASE="https://heavy-dogs-smile.loca.lt/api"
npm run dev
```

---

## 🎉 접속하기!

### 관리자 대시보드
```
https://[프론트엔드URL]
```

### 회원용 앱
```
https://[프론트엔드URL]/app
```

예시:
- 관리자: `https://bright-foxes-jump.loca.lt`
- 회원 앱: `https://bright-foxes-jump.loca.lt/app`

---

## ⚠️ 첫 접속 시

LocalTunnel 첫 접속 시 **보안 화면**이 나옵니다:

1. "Remind me" 또는 "Continue" 클릭
2. 나타나는 **Tunnel Password** 입력창에:
   - PowerShell에 표시된 IP 주소 입력
   - 또는 그냥 아무거나 입력해도 작동
3. "Submit" 클릭

이후부터는 바로 접속됩니다!

---

## 📱 공유하기

이제 누구에게나 URL을 공유할 수 있습니다:

### 카카오톡으로 공유
```
안녕! 내가 만든 체육관 관리 서비스야 🏋️

👉 관리자: https://[프론트엔드URL]
👉 회원 앱: https://[프론트엔드URL]/app

한번 들어와봐!
```

### QR 코드 생성
1. https://www.qr-code-generator.com/ 접속
2. URL 입력
3. QR 코드 다운로드
4. 친구들에게 스캔하게 하기!

---

## 🔄 터널 재시작

터널이 끊기거나 URL을 바꾸고 싶다면:

```powershell
# 백엔드 터널 재시작
lt --port 8000

# 프론트엔드 터널 재시작
lt --port 3000
```

---

## 💡 Tip

### 고정 URL 사용하기 (프리미엄)
```powershell
lt --port 3000 --subdomain my-gym-app
```
→ `https://my-gym-app.loca.lt` (매번 동일한 URL)

**주의**: 무료 버전은 랜덤 URL만 가능!

---

## 🛑 터널 종료

사용이 끝나면:
1. LocalTunnel PowerShell 창에서 `Ctrl + C`
2. 서버 PowerShell 창에서 `Ctrl + C`

---

## 📊 현재 상태 확인

### 실행 중인 프로세스
```powershell
# Django 서버 확인
Get-Process python -ErrorAction SilentlyContinue

# Next.js 서버 확인
Get-Process node -ErrorAction SilentlyContinue
```

### 포트 확인
```powershell
# 8000번 포트 (백엔드)
netstat -ano | findstr :8000

# 3000번 포트 (프론트엔드)
netstat -ano | findstr :3000
```

---

## 🎯 완료 체크리스트

- [ ] 백엔드 서버 실행 중 (Django, 8000번 포트)
- [ ] 프론트엔드 서버 실행 중 (Next.js, 3000번 포트)
- [ ] 백엔드 터널 생성 완료 (LocalTunnel, https://xxxxx.loca.lt)
- [ ] 프론트엔드 터널 생성 완료 (LocalTunnel, https://yyyyy.loca.lt)
- [ ] 프론트엔드 환경 변수 업데이트 (NEXT_PUBLIC_API_BASE)
- [ ] 인터넷에서 접속 가능!

---

## 🚀 다음 단계

### 영구적인 배포를 원한다면:
- `DEPLOY.md` 파일 참고
- Vercel + Render 사용
- 무료, 24시간 작동

### 지금은 테스트만:
- LocalTunnel로 충분!
- 친구들에게 보여주기 완료!

---

**🎊 축하합니다! 이제 전세계 어디서나 접속 가능합니다!**

**URL을 확인하시면 접속해보세요!** 🌐



