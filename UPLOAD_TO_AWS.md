# AWS Django Admin 디자인 업데이트 방법

## 🎯 목표
`http://3.27.28.175:8000/admin/` 페이지에 새로운 디자인 적용

## 📦 업로드할 파일

### 1. `gym_api/config/settings.py`
**위치**: `C:\Users\guddn\Downloads\COCO\gym_api\config\settings.py`
**변경사항**:
- JAZZMIN_UI_TWEAKS 수정
- theme: "lux"
- navbar: gradient
- sidebar: dark

### 2. `gym_api/members/static/admin/css/custom_admin.css`
**위치**: `C:\Users\guddn\Downloads\COCO\gym_api\members\static\admin\css\custom_admin.css`
**변경사항**:
- 새로 생성된 500+ 줄의 CSS 파일
- 그라데이션, 애니메이션, 모던 디자인

## 🚀 방법 1: SSH를 통한 업데이트 (권장)

### Step 1: SSH 접속
```bash
ssh -i /path/to/your-key.pem ubuntu@3.27.28.175
```

### Step 2: 프로젝트 디렉토리 찾기
```bash
# 가능한 위치들
cd ~/gym_api
# 또는
cd /home/ubuntu/gym_api
# 또는
cd /var/www/gym_api
# 또는
find / -name "manage.py" 2>/dev/null | grep gym
```

### Step 3: 파일 업로드 (로컬에서)
```bash
# settings.py 업로드
scp -i /path/to/your-key.pem C:\Users\guddn\Downloads\COCO\gym_api\config\settings.py ubuntu@3.27.28.175:/path/to/gym_api/config/

# custom_admin.css 업로드
scp -i /path/to/your-key.pem C:\Users\guddn\Downloads\COCO\gym_api\members\static\admin\css\custom_admin.css ubuntu@3.27.28.175:/path/to/gym_api/members/static/admin/css/
```

### Step 4: Static 파일 수집
```bash
cd /path/to/gym_api
python3 manage.py collectstatic --noinput
```

### Step 5: 서버 재시작
```bash
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

## 🚀 방법 2: WinSCP를 사용한 업로드

### Step 1: WinSCP 다운로드 및 설치
https://winscp.net/

### Step 2: 연결 설정
- 호스트: 3.27.28.175
- 사용자: ubuntu
- 포트: 22
- 프라이빗 키: your-key.pem

### Step 3: 파일 드래그 앤 드롭
1. `settings.py` → `/path/to/gym_api/config/`
2. `custom_admin.css` → `/path/to/gym_api/members/static/admin/css/`

### Step 4: PuTTY로 명령 실행
```bash
cd /path/to/gym_api
python3 manage.py collectstatic --noinput
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

## 🚀 방법 3: AWS Systems Manager (Session Manager)

### Step 1: AWS 콘솔 접속
1. AWS Console → EC2
2. 인스턴스 선택 (3.27.28.175)
3. "연결" 버튼 클릭
4. "Session Manager" 탭

### Step 2: 파일 내용 직접 수정
```bash
# settings.py 수정
nano /path/to/gym_api/config/settings.py

# custom_admin.css 생성
mkdir -p /path/to/gym_api/members/static/admin/css
nano /path/to/gym_api/members/static/admin/css/custom_admin.css
```

### Step 3: 파일 내용 붙여넣기
(로컬 파일 내용을 복사해서 붙여넣기)

### Step 4: 적용
```bash
python3 manage.py collectstatic --noinput
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

## 🎨 적용 후 확인

1. 브라우저에서 `http://3.27.28.175:8000/admin/` 접속
2. **Ctrl+Shift+R** (강력 새로고침)
3. 새로운 디자인 확인:
   - ✅ 그라데이션 Navbar (보라-파랑)
   - ✅ 다크 사이드바
   - ✅ 모던한 카드
   - ✅ 그라데이션 버튼

## ❓ 어떤 방법을 선택해야 할까요?

- **SSH 키가 있으면**: 방법 1 (가장 빠름)
- **GUI를 선호하면**: 방법 2 (WinSCP)
- **키가 없으면**: 방법 3 (AWS Console)

## 🆘 문제 해결

### 디자인이 적용되지 않으면

1. **브라우저 캐시 삭제**
   - Ctrl+Shift+Delete
   - 캐시 삭제 후 재접속

2. **Static 파일 경로 확인**
   ```bash
   python3 manage.py findstatic admin/css/custom_admin.css
   ```

3. **서버 로그 확인**
   ```bash
   sudo journalctl -u gunicorn -n 50
   sudo tail -f /var/log/nginx/error.log
   ```

4. **권한 확인**
   ```bash
   ls -la /path/to/gym_api/members/static/admin/css/
   chmod 644 /path/to/gym_api/members/static/admin/css/custom_admin.css
   ```

## 📞 다음 단계

어떤 방법으로 진행하시겠습니까?

1. SSH 키 위치를 알려주시면 명령어를 완성해드리겠습니다
2. AWS 콘솔로 진행하시려면 파일 내용을 복사해드리겠습니다
3. WinSCP 설정을 도와드리겠습니다

선택해주세요! 🚀


