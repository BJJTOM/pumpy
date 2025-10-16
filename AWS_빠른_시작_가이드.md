# 🚀 펌피(Pumpy) AWS 빠른 시작 가이드

## ⏱️ 예상 소요 시간: 30분

---

## 📋 준비물
- ✅ AWS 계정 (신규 가입 완료)
- ✅ 신용카드 (무료 체험 등록용)
- ✅ 프로젝트 파일 (이미 준비됨)

---

## 🎯 단계별 진행

### 1단계: AWS Lightsail 인스턴스 생성 (5분)

#### 1. AWS Lightsail 접속
```
https://lightsail.aws.amazon.com/
```

#### 2. 인스턴스 생성
1. **"Create instance"** 버튼 클릭
2. **Region**: `Seoul (ap-northeast-2)` 선택
3. **Platform**: `Linux/Unix` 선택
4. **Blueprint**: 
   - `OS Only` 탭 클릭
   - `Ubuntu 22.04 LTS` 선택
5. **Instance plan**: 
   - `$5 USD` 플랜 선택 (1GB RAM, 40GB SSD)
   - 💡 첫 3개월 무료!
6. **Instance name**: `pumpy-server` 입력
7. **"Create instance"** 클릭

#### 3. 방화벽 포트 열기
1. 생성된 인스턴스 클릭
2. **"Networking"** 탭 클릭
3. **"IPv4 Firewall"** 섹션에서:
   - ✅ SSH (22) - 기본 포함
   - ✅ HTTP (80) - **"+ Add rule"** 클릭해서 추가
   - ✅ HTTPS (443) - **"+ Add rule"** 클릭해서 추가
   - ✅ Custom (8000) - **"+ Add rule"** 클릭해서 추가

#### 4. 고정 IP 할당
1. **"Networking"** 탭에서
2. **"Create static IP"** 클릭
3. 인스턴스 선택 (`pumpy-server`)
4. 이름 입력: `pumpy-static-ip`
5. **"Create"** 클릭
6. 📝 **할당된 IP 주소를 메모하세요!** (예: 13.124.xxx.xxx)

---

### 2단계: 프로젝트 파일 업로드 (5분)

#### 방법 A: GitHub 사용 (추천)

##### GitHub에 코드 업로드 (로컬 PC에서)
```powershell
cd C:\Users\guddn\Downloads\COCO

# .gitignore 확인
git add .
git commit -m "AWS 배포 준비"
git push origin main
```

##### Lightsail에서 다운로드
1. Lightsail 콘솔에서 인스턴스 클릭
2. **"Connect using SSH"** 클릭 (브라우저 SSH 터미널 열림)
3. 다음 명령어 실행:
```bash
cd /home/ubuntu
git clone https://github.com/BJJTOM/pumpy.git
```

#### 방법 B: FileZilla로 직접 업로드

1. **FileZilla 다운로드 및 설치**
   - https://filezilla-project.org/download.php

2. **Lightsail SSH 키 다운로드**
   - Lightsail 콘솔 → Account → SSH Keys
   - 키 다운로드 (예: LightsailDefaultKey-ap-northeast-2.pem)

3. **FileZilla 연결 설정**
   - Host: `sftp://YOUR_STATIC_IP`
   - Username: `ubuntu`
   - Password: (비워둠)
   - Port: `22`
   - Logon Type: `Key file`
   - Key file: 다운로드한 .pem 파일 선택

4. **파일 업로드**
   - 왼쪽(로컬): `C:\Users\guddn\Downloads\COCO`
   - 오른쪽(서버): `/home/ubuntu/`
   - `gym_api`와 `gym_web` 폴더를 드래그해서 업로드
   - 폴더명을 `pumpy`로 변경

---

### 3단계: 자동 배포 스크립트 실행 (15분)

#### 1. Lightsail SSH 터미널에서 실행

```bash
# 배포 스크립트에 실행 권한 부여
cd /home/ubuntu/pumpy
chmod +x deploy_to_aws.sh

# 배포 스크립트 실행
./deploy_to_aws.sh
```

💡 **스크립트가 자동으로 다음 작업을 수행합니다:**
- ✅ 시스템 업데이트
- ✅ Python, Node.js, Nginx, PostgreSQL 설치
- ✅ 데이터베이스 생성
- ✅ Django 마이그레이션
- ✅ Next.js 빌드
- ✅ 서비스 시작

#### 2. 배포 완료 후 표시되는 정보 확인
```
웹사이트: http://YOUR_IP/
API:      http://YOUR_IP/api/
관리자:   http://YOUR_IP/admin/
```

---

### 4단계: Django 관리자 계정 생성 (2분)

```bash
cd /home/ubuntu/pumpy/gym_api
source venv/bin/activate
python manage.py createsuperuser
```

다음 정보 입력:
- Username: `admin`
- Email: `your@email.com`
- Password: (안전한 비밀번호 입력)
- Password (again): (재입력)

---

### 5단계: 접속 테스트 (3분)

#### 1. 웹 브라우저에서 접속
```
http://YOUR_STATIC_IP/
```

#### 2. API 테스트
```
http://YOUR_STATIC_IP/api/members/
```

#### 3. 관리자 페이지 접속
```
http://YOUR_STATIC_IP/admin/
```

---

### 6단계: React Native 앱 설정 (5분)

#### 1. API URL 변경

**로컬 PC에서:**
```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp\src\utils
notepad api.ts
```

다음 내용으로 수정:
```typescript
export const getApiUrl = async (): Promise<string> => {
  try {
    const savedUrl = await AsyncStorage.getItem('serverUrl');
    if (savedUrl) {
      console.log('Using saved URL:', savedUrl);
      return savedUrl;
    }
  } catch (error) {
    console.error('Error getting API URL:', error);
  }
  
  // AWS Lightsail 기본 URL
  return 'http://YOUR_STATIC_IP/api'; // 여기에 실제 IP 입력!
};
```

**YOUR_STATIC_IP를 실제 IP로 변경!** (예: `http://13.124.123.456/api`)

#### 2. ServerConfigScreen 기본 URL 변경

```powershell
notepad C:\Users\guddn\Downloads\COCO\PumpyApp\src\screens\ServerConfigScreen.tsx
```

35번째 줄 수정:
```typescript
setServerUrl('http://YOUR_STATIC_IP/api'); // 실제 IP로 변경
```

#### 3. APK 재빌드

```powershell
cd C:\Users\guddn\Downloads\COCO\PumpyApp\android
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.8.9-hotspot"
$env:ANDROID_HOME = "C:\Users\guddn\AppData\Local\Android\Sdk"
.\gradlew assembleRelease
```

#### 4. APK 복사
```powershell
Copy-Item "C:\Users\guddn\Downloads\COCO\PumpyApp\android\app\build\outputs\apk\release\app-release.apk" -Destination "C:\Users\guddn\Downloads\COCO\Pumpy_AWS버전.apk" -Force
```

---

## ✅ 완료!

### 📱 앱 사용하기

1. **APK 설치**
   - `Pumpy_AWS버전.apk` 파일을 폰에 전송
   - 설치

2. **앱 실행**
   - 서버 설정 화면에서 자동으로 AWS IP 표시됨
   - **"기본 URL로 계속하기"** 클릭
   - 회원가입 또는 로그인

3. **이제 어디서든 접속 가능!** 🎉
   - Wi-Fi 상관없음
   - 4G/5G 데이터로도 접속 가능
   - PC 꺼도 됨!

---

## 💰 비용

### AWS Lightsail
- **첫 3개월**: 완전 무료
- **이후**: $5/월 (약 6,500원)
- **데이터 전송**: 1TB 포함 (충분함)

### 예상 월 비용: $5 (₩6,500)

---

## 🔧 유용한 명령어

### 서비스 상태 확인
```bash
# Django 백엔드
sudo systemctl status gunicorn

# Next.js 프론트엔드
pm2 status

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql
```

### 서비스 재시작
```bash
# Django 재시작
sudo systemctl restart gunicorn

# Next.js 재시작
pm2 restart pumpy-web

# Nginx 재시작
sudo systemctl restart nginx
```

### 로그 확인
```bash
# Django 로그
sudo journalctl -u gunicorn -f

# Next.js 로그
pm2 logs pumpy-web

# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log
```

### 코드 업데이트 (Git 사용 시)
```bash
cd /home/ubuntu/pumpy

# 백엔드 업데이트
cd gym_api
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn

# 프론트엔드 업데이트
cd ../gym_web
git pull
npm install
npm run build
pm2 restart pumpy-web
```

---

## 🆘 문제 해결

### 502 Bad Gateway 오류
```bash
# 1. Gunicorn 재시작
sudo systemctl restart gunicorn
sudo systemctl status gunicorn

# 2. 로그 확인
sudo journalctl -u gunicorn -n 50
```

### 웹사이트 안 열림
```bash
# 1. Nginx 상태 확인
sudo systemctl status nginx

# 2. 방화벽 확인
sudo ufw status

# 3. 포트 확인
sudo netstat -tlnp | grep :80
```

### 데이터베이스 연결 오류
```bash
# PostgreSQL 재시작
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

---

## 📊 체크리스트

### 배포 전
- [ ] AWS 계정 생성
- [ ] 신용카드 등록
- [ ] GitHub에 코드 업로드 (선택)

### Lightsail 설정
- [ ] 인스턴스 생성 ($5 플랜)
- [ ] 방화벽 포트 열기 (80, 443, 8000)
- [ ] 고정 IP 할당
- [ ] SSH 접속 확인

### 배포 실행
- [ ] 코드 업로드 (Git 또는 FileZilla)
- [ ] 배포 스크립트 실행
- [ ] 관리자 계정 생성
- [ ] 웹사이트 접속 테스트
- [ ] API 접속 테스트

### 앱 설정
- [ ] API URL 변경
- [ ] APK 재빌드
- [ ] 앱 설치 및 테스트

---

## 🎉 성공!

이제 펌피 앱이 AWS 클라우드에서 실행됩니다!

- ✅ 24시간 365일 실행
- ✅ 어디서든 접속 가능
- ✅ PC 꺼도 됨
- ✅ 빠른 속도
- ✅ 안정적인 서비스

**축하합니다!** 🎊

---

## 📞 서버 정보 요약

```
공개 IP: YOUR_STATIC_IP (Lightsail에서 확인)
웹사이트: http://YOUR_STATIC_IP/
API: http://YOUR_STATIC_IP/api/
관리자: http://YOUR_STATIC_IP/admin/

데이터베이스:
- 이름: pumpy_db
- 사용자: pumpy_user
- 비밀번호: PumpySecure2025!

SSH 접속:
ssh ubuntu@YOUR_STATIC_IP
```

---

작성일: 2025-10-15
소요 시간: 약 30분
월 비용: $5 (첫 3개월 무료)


