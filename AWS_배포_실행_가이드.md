# 🚀 AWS 서버 배포 가이드

## 문제 상황
- ❌ 로컬 환경: AI 캐릭터, 출석 통계 등 최신 기능 작동
- ❌ AWS 서버 (http://3.27.28.175/app/): 기능 누락
- ❌ 두 환경이 다름

## 해결 방법
로컬의 최신 코드를 AWS 서버에 배포!

---

## 방법 1: 자동 배포 스크립트 (추천)

### Windows PowerShell
```powershell
cd C:\Users\guddn\Downloads\COCO
.\deploy_to_aws_simple.ps1
```

이 스크립트가 자동으로:
1. ✅ 백엔드 코드 업로드 (members 앱, 설정 파일)
2. ✅ 프론트엔드 코드 업로드 (app, lib, package.json)
3. ✅ 백엔드 재시작 (Gunicorn)
4. ✅ 프론트엔드 재시작 (PM2)

### 소요 시간
약 2-3분

---

## 방법 2: 수동 배포 (SSH 사용)

### 1. 파일 업로드
```powershell
# 백엔드
scp -r gym_api/members ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_api/
scp gym_api/config/settings.py ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_api/config/

# 프론트엔드
scp -r gym_web/app ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/
scp -r gym_web/lib ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/
```

### 2. SSH 접속 후 재시작
```bash
ssh ubuntu@3.27.28.175

# 백엔드
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn

# 프론트엔드
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 restart gym_web
pm2 save

exit
```

---

## 배포 후 확인

### 브라우저에서 접속
```
http://3.27.28.175:3000/app
```

### 확인할 기능들
- [ ] AI 캐릭터 이미지 표시
- [ ] 출석 통계 (연속일, 이번 달, 총 출석)
- [ ] 신체 정보 표시
- [ ] 커뮤니티 기능 작동
- [ ] 로그인/회원가입 작동

---

## 배포되는 주요 기능

### HomeScreen
```typescript
// AI 캐릭터 이미지 로드
const memberRes = await axios.get(`${apiBase}/members/${user.id}/`);
setAiPhoto(memberRes.data.ai_photo || '기본이미지');

// 출석 통계 계산
const consecutive = calculateConsecutiveDays(attendanceData);
const thisMonth = calculateThisMonthAttendance(attendanceData);
```

### CommunityPage
```typescript
// 게시글 로드
const postsRes = await axios.get(`${apiBase}/posts/`);
setPosts(postsRes.data);

// 좋아요 기능
await axios.post(`${apiBase}/posts/${postId}/like/`);

// 댓글 작성
await axios.post(`${apiBase}/posts/${postId}/comment/`);
```

---

## 문제 해결

### SSH 접속 안 될 때
```bash
# SSH 키 확인
ssh ubuntu@3.27.28.175

# 키가 없으면 AWS 콘솔에서 다운로드
# .pem 파일을 ~/.ssh/ 에 저장
```

### 배포 후에도 변경사항이 안 보일 때
```bash
# 브라우저 캐시 강제 새로고침
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# 또는 시크릿 모드로 접속
```

### 서버 상태 확인
```bash
ssh ubuntu@3.27.28.175

# Django 확인
sudo systemctl status gunicorn
sudo journalctl -u gunicorn -f

# Next.js 확인
pm2 status
pm2 logs gym_web

# Nginx 확인
sudo systemctl status nginx
```

---

## 배포 전후 비교

### 배포 전 (AWS)
```
❌ AI 캐릭터: 기본 아바타만
❌ 출석 통계: 제한적
❌ 커뮤니티: 기능 부족
❌ 로컬과 다름
```

### 배포 후 (AWS)
```
✅ AI 캐릭터: 요가 이미지 등
✅ 출석 통계: 연속일, 이번 달, 총 출석
✅ 커뮤니티: 완전 작동
✅ 로컬과 동일
```

---

## 접속 정보

### 로컬 개발 환경
- 웹: http://localhost:3000
- 앱: http://localhost:3000/app
- API: http://localhost:8000/api

### AWS 프로덕션 환경
- 웹: http://3.27.28.175:3000
- 앱: http://3.27.28.175:3000/app
- API: http://3.27.28.175:8000/api

---

## 지금 바로 실행!

```powershell
cd C:\Users\guddn\Downloads\COCO
.\deploy_to_aws_simple.ps1
```

배포 완료 후 브라우저에서 확인:
```
http://3.27.28.175:3000/app
```

---

생성 일시: 2025-10-16
상태: ✅ 배포 스크립트 준비 완료






