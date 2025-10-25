# 🔧 AWS 서버 문제 해결 가이드

## 🚨 현재 문제

```
❌ SSH 포트 (22): 닫힘
❌ HTTP 포트 (80): 닫힘  
❌ Ping: 응답 없음
```

**원인:** 인스턴스가 중지되었거나 보안그룹이 모든 포트를 차단 중

---

## ✅ 해결 방법 (순서대로 시도)

### 방법 1: AWS 콘솔에서 인스턴스 시작 (가장 먼저!)

1. **AWS 콘솔 접속**
   - https://console.aws.amazon.com/ec2

2. **인스턴스 확인**
   - 왼쪽 메뉴 → **EC2 대시보드**
   - **인스턴스** 클릭
   - 인스턴스 찾기 (IP: 3.27.28.175)

3. **인스턴스 상태 확인**
   - 상태가 **"중지됨"** 이면:
     ```
     ✅ 인스턴스 선택
     ✅ 인스턴스 상태 → 인스턴스 시작
     ✅ 1-2분 대기
     ```
   
   - 상태가 **"실행 중"** 이면:
     ```
     → 방법 2로 이동 (보안그룹 확인)
     ```

4. **시작 후 확인**
   ```powershell
   Test-NetConnection -ComputerName 3.27.28.175 -Port 80
   ```
   
   - True 나오면 성공! → http://3.27.28.175 접속

---

### 방법 2: 보안 그룹 설정 확인

1. **보안 그룹 확인**
   - EC2 → 인스턴스 → 인스턴스 선택
   - 하단 **보안** 탭 클릭
   - **보안 그룹** 클릭

2. **인바운드 규칙 확인**
   - **인바운드 규칙** 탭 선택
   - 다음 규칙이 있는지 확인:

   ```
   ✅ SSH     | TCP | 22  | 0.0.0.0/0 | SSH 접속용
   ✅ HTTP    | TCP | 80  | 0.0.0.0/0 | 웹 접속용
   ✅ HTTPS   | TCP | 443 | 0.0.0.0/0 | 보안 웹 접속
   ✅ Custom  | TCP | 8000| 0.0.0.0/0 | Django API
   ```

3. **규칙 추가 (없으면)**
   - **인바운드 규칙 편집** 클릭
   - **규칙 추가** 클릭
   - 위 4개 규칙 추가
   - **규칙 저장** 클릭

---

### 방법 3: Session Manager로 직접 접속

SSH 없이 웹 브라우저로 직접 접속!

1. **AWS 콘솔에서 인스턴스 선택**

2. **연결 버튼 클릭**
   - 상단 **연결** 버튼
   
3. **Session Manager 선택**
   - **Session Manager** 탭
   - **연결** 클릭

4. **터미널에서 명령어 실행**
   ```bash
   # 프로젝트 업데이트
   cd ~/pumpy
   git pull origin main
   
   # 백엔드 배포
   cd gym_api
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py collectstatic --noinput
   sudo systemctl restart gunicorn
   
   # 프론트엔드 배포
   cd ../gym_web
   npm install
   npm run build
   pm2 restart gym-web || pm2 start npm --name gym-web -- start
   pm2 save
   
   # Nginx 재시작
   sudo systemctl restart nginx
   
   # 상태 확인
   sudo systemctl status gunicorn
   pm2 status
   sudo systemctl status nginx
   ```

5. **완료 확인**
   - http://3.27.28.175 접속

---

### 방법 4: 인스턴스 재시작

인스턴스가 응답하지 않으면 재시작:

1. **인스턴스 선택**
2. **인스턴스 상태** → **인스턴스 재부팅**
3. **재부팅** 확인
4. 2-3분 대기 후 접속

---

## 🚀 빠른 실행 명령어

### PowerShell에서 서버 상태 확인:

```powershell
# HTTP 포트 확인
Test-NetConnection -ComputerName 3.27.28.175 -Port 80

# SSH 포트 확인  
Test-NetConnection -ComputerName 3.27.28.175 -Port 22

# Ping 확인
Test-Connection -ComputerName 3.27.28.175 -Count 2
```

### SSH로 배포 (SSH 포트 열리면):

```powershell
ssh -i "C:\Users\guddn\Downloads\COCO\pumpy-key.pem" ubuntu@3.27.28.175 "cd ~/pumpy && git pull && cd gym_api && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && sudo systemctl restart gunicorn && cd ../gym_web && npm install && npm run build && pm2 restart gym-web && sudo systemctl restart nginx"
```

---

## 📊 문제 해결 체크리스트

- [ ] 1. AWS 콘솔 로그인
- [ ] 2. EC2 인스턴스 상태 확인
- [ ] 3. 인스턴스 시작 (중지된 경우)
- [ ] 4. 보안 그룹 인바운드 규칙 확인
- [ ] 5. 필요한 포트 열기 (22, 80, 443, 8000)
- [ ] 6. Session Manager로 접속
- [ ] 7. 배포 명령어 실행
- [ ] 8. http://3.27.28.175 접속 확인

---

## 🎯 최종 확인

배포 완료 후:

```
✅ 웹 앱: http://3.27.28.175
✅ 회원 앱: http://3.27.28.175/app
✅ 관리자: http://3.27.28.175/admin
✅ APK: C:\Users\guddn\Downloads\COCO\Pumpy_v2_Final.apk
```

---

## 💡 TIP

**가장 빠른 방법:**
1. AWS 콘솔 → 인스턴스 시작 (중지된 경우)
2. Session Manager로 접속
3. 위의 배포 명령어 복사 & 실행

**예상 시간:** 5-10분

---

**문제가 계속되면:**
- 인스턴스 재부팅 시도
- AWS 지원팀에 문의
- 또는 새 인스턴스 생성 고려

---

작성: 2025-10-25
버전: 1.0

