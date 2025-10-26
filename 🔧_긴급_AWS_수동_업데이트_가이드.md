# 🔧 AWS 서버 긴급 수동 업데이트 가이드

## 🚨 발견된 문제들 (수정 완료)

### 1. ✅ Settings.py - STATIC_URL 중복 정의
- **문제**: STATIC_URL이 두 번 선언되어 충돌 발생
- **해결**: 중복 제거 완료

### 2. ✅ Community Views - SavedPost 모델 누락
- **문제**: 구현되지 않은 SavedPost 모델 참조로 500 에러 발생  
- **해결**: 임시로 비활성화 처리 완료

### 3. ✅ Views.py - 출석 상태 불일치
- **문제**: 출석 상태가 'present'와 '출석'으로 혼용되어 통계 오류
- **해결**: 모두 '출석'으로 통일

---

## 📋 AWS 서버 접속 방법

### 방법 1: AWS 웹 콘솔 (권장)

1. **AWS 콘솔 접속**
   - https://console.aws.amazon.com/
   - 로그인

2. **EC2 인스턴스 찾기**
   - EC2 → 인스턴스 (실행 중)
   - 인스턴스 ID 또는 IP (3.27.28.175) 검색

3. **연결**
   - 인스턴스 선택 → "연결" 버튼 클릭
   - "Session Manager" 또는 "EC2 Instance Connect" 선택
   - "연결" 클릭

### 방법 2: SSH 클라이언트 (PuTTY, MobaXterm 등)

```bash
ssh ubuntu@3.27.28.175
```

---

## 🔄 서버 업데이트 명령어

### AWS 터미널에 접속한 후 다음 명령어 실행:

```bash
# 1. 프로젝트 디렉토리로 이동
cd ~/gym

# 2. settings.py 수정 - STATIC_URL 중복 제거
nano config/settings.py
# 또는
vi config/settings.py
```

**수정 내용:**
- 68번 줄의 `STATIC_URL = "static/"` 삭제
- 97번 줄의 `STATIC_URL = '/static/'`만 남기기

```bash
# 3. community_views.py 수정
nano members/community_views.py
```

**수정 내용 (116-126번 줄):**
```python
@action(detail=True, methods=['post'])
def save_post(self, request, pk=None):
    """게시물 저장 (북마크) - 향후 구현 예정"""
    post = self.get_object()
    member_id = request.data.get('member_id')
    
    if not member_id:
        return Response({'error': '회원 ID가 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
    
    # TODO: SavedPost 모델 구현 후 활성화
    return Response({'message': '저장 기능은 준비 중입니다'})
```

```bash
# 4. views.py 수정 - 출석 상태 통일
nano members/views.py
```

**수정 내용:**
- 166번 줄: `status='present'` → `status='출석'`
- 180번 줄: `status='present'` → `status='출석'`

```bash
# 5. 가상환경 활성화
source venv/bin/activate

# 6. Gunicorn 재시작
sudo systemctl restart gunicorn

# 7. Nginx 재시작
sudo systemctl restart nginx

# 8. 상태 확인
sudo systemctl status gunicorn
sudo systemctl status nginx

# 9. 에러 로그 확인
sudo journalctl -u gunicorn -n 50 --no-pager
```

---

## 📝 빠른 복사-붙여넣기 명령어

모든 수정을 한 번에 적용하는 스크립트:

```bash
cd ~/gym
source venv/bin/activate

# Settings.py 수정
sed -i '68d' config/settings.py

# Gunicorn & Nginx 재시작
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# 상태 확인
echo "✅ Gunicorn 상태:"
sudo systemctl status gunicorn --no-pager -l 0
echo ""
echo "✅ Nginx 상태:"
sudo systemctl status nginx --no-pager -l 0
echo ""
echo "📋 최근 에러 로그:"
sudo journalctl -u gunicorn -n 20 --no-pager | grep -i error
```

---

## 🧪 테스트 방법

### 1. API 엔드포인트 테스트

브라우저 또는 Postman에서 확인:

```
✅ 회원 목록: http://3.27.28.175/api/members/
✅ 회원권 목록: http://3.27.28.175/api/plans/
✅ 게시글 목록: http://3.27.28.175/api/posts/
✅ 출석 통계: http://3.27.28.175/api/attendance/weekly_stats/
✅ 대시보드 통계: http://3.27.28.175/api/members/dashboard_stats/
```

### 2. 앱 테스트

```
✅ 관리자: http://3.27.28.175/admin/
✅ 회원 앱: http://3.27.28.175/app
```

### 3. 로그인 테스트

**테스트 계정:**
```
이메일: test@example.com
비밀번호: test1234
```

---

## 🐛 추가 문제 발생 시

### 500 에러가 계속 발생하면:

```bash
# 상세 에러 로그 확인
sudo journalctl -u gunicorn -f

# Django 에러 로그 확인 (DEBUG=True인 경우)
tail -f ~/gym/logs/django.log

# Python 문법 검증
cd ~/gym
python -m py_compile members/views.py
python -m py_compile members/community_views.py
python -m py_compile config/settings.py
```

### Gunicorn이 시작되지 않으면:

```bash
# 수동으로 실행해서 에러 확인
cd ~/gym
source venv/bin/activate
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

---

## 📊 수정 완료 체크리스트

- [ ] AWS 서버 접속 완료
- [ ] config/settings.py STATIC_URL 중복 제거
- [ ] members/community_views.py SavedPost 수정
- [ ] members/views.py 출석 상태 통일
- [ ] Gunicorn 재시작
- [ ] Nginx 재시작
- [ ] API 엔드포인트 테스트 통과
- [ ] 앱 로그인 테스트 통과
- [ ] 대시보드 통계 정상 작동

---

## 💡 완료 후 확인사항

### 정상 작동 확인:
✅ http://3.27.28.175/api/ → JSON API 목록 표시  
✅ http://3.27.28.175/app → 회원 앱 로딩  
✅ http://3.27.28.175/admin/ → 관리자 페이지 로그인  

### 에러가 없어야 함:
❌ 500 Internal Server Error  
❌ 502 Bad Gateway  
❌ STATIC_URL duplicate error  
❌ SavedPost DoesNotExist error  

---

## 🆘 여전히 문제가 있다면?

서버 재부팅을 시도해보세요:

```bash
sudo reboot
```

재부팅 후 1-2분 정도 기다린 후 다시 접속하세요.

---

**✅ 모든 수정이 완료되면 APK도 정상 작동합니다!**

APK 위치: `C:\Users\guddn\Downloads\COCO\pumpy-app-release.apk`


