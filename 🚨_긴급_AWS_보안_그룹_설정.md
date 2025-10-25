# 🚨 긴급: AWS 보안 그룹 설정 필요!

## ⚠️ 문제 발견

현재 **3.27.28.175** 서버의 모든 포트가 차단되어 있습니다:
- ❌ SSH (22번 포트): 차단
- ❌ HTTP (80번 포트): 차단
- ❌ HTTPS (443번 포트): 차단 (추정)

**따라서 배포와 접속이 불가능합니다!**

---

## ✅ 해결 방법 (5분 안에 해결 가능)

### 1단계: AWS 콘솔 접속

https://console.aws.amazon.com/ec2/

### 2단계: 보안 그룹 설정 변경

1. **좌측 메뉴** > **네트워크 및 보안** > **보안 그룹**
2. EC2 인스턴스에 연결된 보안 그룹 선택
3. **인바운드 규칙** 탭 클릭
4. **인바운드 규칙 편집** 클릭

### 3단계: 다음 규칙 추가

| 유형 | 프로토콜 | 포트 범위 | 소스 | 설명 |
|------|---------|----------|------|------|
| SSH | TCP | 22 | 0.0.0.0/0 | SSH 접속 |
| HTTP | TCP | 80 | 0.0.0.0/0 | 웹사이트 |
| HTTPS | TCP | 443 | 0.0.0.0/0 | 보안 웹사이트 |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | Django API |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Next.js (개발) |

**보안 강화 (권장)**:
- "0.0.0.0/0" 대신 "내 IP"를 선택하여 본인 IP만 접속 가능하게 설정

### 4단계: 저장

**규칙 저장** 버튼 클릭

---

## 🎯 보안 그룹 설정 후 실행할 명령어

### 방법 1: AWS Session Manager (키 불필요!)

1. **EC2 콘솔** > **인스턴스** 선택
2. **연결** 버튼 클릭
3. **Session Manager** 탭 선택
4. **연결** 클릭

접속 후 다음 명령어 실행:

```bash
cd ~/pumpy 2>/dev/null || (cd ~ && git clone https://github.com/BJJTOM/pumpy.git && cd pumpy)
git pull origin main
cd gym_api
source venv/bin/activate 2>/dev/null || (python3 -m venv venv && source venv/bin/activate)
pip install -r requirements.txt
python manage.py makemigrations && python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
cd ../gym_web
npm install
npm run build
pm2 delete gym-web 2>/dev/null || true
pm2 start npm --name "gym-web" -- start
pm2 save
sudo systemctl restart nginx
echo "✅ 배포 완료! http://3.27.28.175 접속하세요"
```

### 방법 2: SSH로 접속 (보안 그룹 설정 후)

```bash
ssh ubuntu@3.27.28.175
```

그 다음 위의 배포 명령어 실행

---

## 📊 전체 프로세스

```
1. AWS 콘솔 접속 (2분)
   ↓
2. 보안 그룹 설정 변경 (3분)
   ↓
3. Session Manager로 서버 접속 (1분)
   ↓
4. 배포 명령어 실행 (10-15분)
   ↓
5. http://3.27.28.175 접속 확인!
```

**총 예상 시간: 약 20분**

---

## 🚨 빠른 체크리스트

- [ ] AWS 콘솔 접속
- [ ] 보안 그룹에서 SSH(22), HTTP(80), HTTPS(443) 열기
- [ ] Session Manager로 서버 접속
- [ ] 배포 명령어 실행
- [ ] http://3.27.28.175 접속 확인

---

## 💡 Session Manager 장점

- ✅ SSH 키 불필요
- ✅ 브라우저에서 바로 접속
- ✅ 가장 쉽고 안전한 방법

**지금 바로 Session Manager를 사용하세요!**

---

## 📞 문제 해결

### "Session Manager를 사용할 수 없습니다"
- IAM 역할에 **AmazonSSMManagedInstanceCore** 정책 추가 필요
- EC2 인스턴스에 SSM Agent 설치 필요

### 대안: EC2 Instance Connect
1. EC2 콘솔 > 인스턴스 선택
2. **연결** > **EC2 Instance Connect** 탭
3. **연결** 클릭

---

## ⚡ 지금 바로 실행하세요!

1. **AWS 콘솔**: https://console.aws.amazon.com/ec2/
2. **보안 그룹 설정** > 포트 열기
3. **Session Manager** > 배포 실행

**모든 명령어는 이미 준비되어 있습니다!**


