# AWS 웹 서버 업데이트 가이드

## 현재 상황
- 로컬 웹 페이지는 최신 스타일 유지
- AWS 서버의 웹 페이지 스타일이 이전 버전으로 복구됨

## 해결 방법

### 방법 1: 수동 파일 업로드 (권장)

```powershell
# 1. 주요 페이지 업로드
cd C:\Users\guddn\Downloads

# 메인 앱 페이지
scp -i pumpy-key.pem C:\Users\guddn\Downloads\COCO\gym_web\app\app\page.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/

# 내 정보 페이지
scp -i pumpy-key.pem -r C:\Users\guddn\Downloads\COCO\gym_web\app\app\info ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/

# 커뮤니티 페이지
scp -i pumpy-key.pem C:\Users\guddn\Downloads\COCO\gym_web\app\app\community\page.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/community/

# 커뮤니티 프로필 페이지
scp -i pumpy-key.pem -r C:\Users\guddn\Downloads\COCO\gym_web\app\app\community\profile ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/community/

# 알림 페이지
scp -i pumpy-key.pem C:\Users\guddn\Downloads\COCO\gym_web\app\app\notifications\page.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/notifications/

# 프로필 페이지
scp -i pumpy-key.pem C:\Users\guddn\Downloads\COCO\gym_web\app\app\profile\page.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/profile/

# 하단 네비게이션
scp -i pumpy-key.pem C:\Users\guddn\Downloads\COCO\gym_web\app\app\components\BottomNav.tsx ubuntu@3.27.28.175:/home/ubuntu/pumpy/gym_web/app/app/components/

# 2. 서버에서 빌드
ssh -i pumpy-key.pem ubuntu@3.27.28.175 "cd /home/ubuntu/pumpy/gym_web && npm run build && pm2 restart gym_web"
```

### 방법 2: 전체 프로젝트 업로드

```powershell
# gym_web 폴더 전체를 압축
cd C:\Users\guddn\Downloads\COCO
tar -czf gym_web_update.tar.gz -C gym_web app lib public

# AWS로 업로드
scp -i C:\Users\guddn\Downloads\pumpy-key.pem gym_web_update.tar.gz ubuntu@3.27.28.175:/home/ubuntu/

# 서버에서 압축 해제 및 적용
ssh -i C:\Users\guddn\Downloads\pumpy-key.pem ubuntu@3.27.28.175 << 'EOF'
cd /home/ubuntu
tar -xzf gym_web_update.tar.gz -C /home/ubuntu/pumpy/gym_web/
cd /home/ubuntu/pumpy/gym_web
npm install
npm run build
pm2 restart gym_web
pm2 save
rm /home/ubuntu/gym_web_update.tar.gz
EOF
```

### 방법 3: Git Pull (가장 간단)

```powershell
# 로컬에서 커밋
cd C:\Users\guddn\Downloads\COCO
git add .
git commit -m "Update web UI - Add info page, fix community"
git push origin main

# 서버에서 pull
ssh -i C:\Users\guddn\Downloads\pumpy-key.pem ubuntu@3.27.28.175 << 'EOF'
cd /home/ubuntu/pumpy
git pull origin main
cd gym_web
npm install
npm run build
pm2 restart gym_web
EOF
```

## 검증

업데이트 후 확인:
1. http://3.27.28.175:3000/app - 메인 홈 화면
2. http://3.27.28.175:3000/app/info - 내 정보 페이지
3. http://3.27.28.175:3000/app/community - 커뮤니티
4. http://3.27.28.175:3000/app/profile - 프로필

확인 사항:
- ✅ BlackShark 테마 (검정 + 금색)
- ✅ 하단 네비게이션 5개 (홈, 커뮤니티, 내정보, 알림, 프로필)
- ✅ 운동 상세 정보
- ✅ 출석 통계
- ✅ 게시글 작성

## 문제 해결

### 스타일이 여전히 이전 버전이라면?

```powershell
# 캐시 삭제
ssh -i C:\Users\guddn\Downloads\pumpy-key.pem ubuntu@3.27.28.175 << 'EOF'
cd /home/ubuntu/pumpy/gym_web
rm -rf .next
npm run build
pm2 restart gym_web
EOF
```

### 빌드 에러가 발생한다면?

```powershell
# 로그 확인
ssh -i C:\Users\guddn\Downloads\pumpy-key.pem ubuntu@3.27.28.175 "pm2 logs gym_web --lines 50"

# 또는
ssh -i C:\Users\guddn\Downloads\pumpy-key.pem ubuntu@3.27.28.175 "cd /home/ubuntu/pumpy/gym_web && npm run build"
```

### 페이지가 로드되지 않는다면?

```powershell
# PM2 상태 확인
ssh -i C:\Users\guddn\Downloads\pumpy-key.pem ubuntu@3.27.28.175 "pm2 status"

# 재시작
ssh -i C:\Users\guddn\Downloads\pumpy-key.pem ubuntu@3.27.28.175 "pm2 restart all"
```










