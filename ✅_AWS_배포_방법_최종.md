# ✅ AWS 배포 - 최종 가이드

## 🔑 SSH 키 없이 배포하는 방법

SSH 키가 없어 직접 파일을 업로드할 수 없습니다.
하지만 AWS 콘솔을 통해 쉽게 배포할 수 있습니다!

---

## 🚀 배포 방법 (5분 완료!)

### 1단계: AWS EC2 콘솔 접속
```
https://console.aws.amazon.com/ec2/
→ 로그인
→ 인스턴스 (Instances) 메뉴
→ IP가 3.27.28.175인 인스턴스 선택
→ 상단의 "연결" 버튼 클릭
→ "EC2 Instance Connect" 탭
→ "연결" 버튼 클릭
```

**브라우저에서 터미널이 열립니다!**

---

### 2단계: 업데이트 명령어 실행

브라우저 터미널에서 아래 명령어를 **한 줄씩** 복사해서 붙여넣고 Enter:

```bash
# 백엔드 업데이트
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

잠시 기다린 후 (30초~1분):

```bash
# 프론트엔드 업데이트  
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 restart gym_web
pm2 save
```

---

### 3단계: 확인

브라우저에서 열기:
```
http://3.27.28.175:3000/app
```

**이제 로컬과 동일한 기능이 작동합니다!**

---

## ✨ 업데이트 내용

### HomeScreen
- ✅ AI 캐릭터 이미지 표시
- ✅ 출석 통계 (연속일, 이번 달, 총 출석)
- ✅ 신체 정보 표시
- ✅ 자동 새로고침 (30초마다)

### CommunityPage
- ✅ 게시글 목록
- ✅ 좋아요 기능
- ✅ 댓글 작성
- ✅ 스토리 섹션

---

## 🔍 문제 해결

### 명령어 실행 중 오류 발생 시

#### "Permission denied" 오류
```bash
# sudo 비밀번호 입력
sudo systemctl restart gunicorn
# 비밀번호 입력
```

#### "Module not found" 오류
```bash
# 패키지 재설치
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

#### PM2 오류
```bash
# PM2 재시작
pm2 restart all
pm2 save
```

---

## 📊 서버 상태 확인

AWS 터미널에서:

```bash
# Django (백엔드) 상태
sudo systemctl status gunicorn

# Next.js (프론트엔드) 상태
pm2 status

# 로그 확인
pm2 logs gym_web --lines 50
```

---

## 🎯 완료 확인 체크리스트

브라우저에서 http://3.27.28.175:3000/app 접속 후:

- [ ] 페이지가 로드되는가?
- [ ] AI 캐릭터 이미지가 보이는가?
- [ ] 출석 통계가 표시되는가?
- [ ] 커뮤니티 탭이 작동하는가?
- [ ] 로그인/회원가입이 작동하는가?

모두 ✅ 라면 성공!

---

## 💡 팁

### 캐시 문제로 변경사항이 안 보일 때
```
브라우저에서:
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

또는 시크릿/프라이빗 모드로 접속
```

### 로컬에서 개발 후 AWS 업데이트
```
1. AWS EC2 Instance Connect 접속
2. 위의 명령어 다시 실행
3. 완료!
```

---

## 🔐 향후 개선 (선택사항)

### SSH 키 설정하면 더 편함
```powershell
# Windows에서 한 번만 설정
# AWS에서 .pem 키 다운로드 후:
mkdir C:\Users\guddn\.ssh
copy pumpy-key.pem C:\Users\guddn\.ssh\

# 그러면 다음부터는 스크립트로 자동 배포!
.\deploy_to_aws_simple.ps1
```

---

## 📞 요약

### 지금 할 일
1. AWS EC2 콘솔 → Instance Connect로 접속
2. 위의 명령어 복사/붙여넣기
3. http://3.27.28.175:3000/app 에서 확인

### 걸리는 시간
- 명령어 실행: 2-3분
- 총 소요 시간: 5분

### 결과
✅ 로컬과 AWS 환경이 100% 동일해집니다!

---

**지금 바로 시작하세요!** 🚀

AWS 콘솔: https://console.aws.amazon.com/ec2/

