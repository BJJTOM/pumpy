import requests
import json

API_URL = 'http://3.27.28.175/api'

print("=" * 60)
print("API를 통한 테스트 계정 생성")
print("=" * 60)

# 테스트 계정 회원가입 데이터
signup_data = {
    'email': 'test@pumpy.com',
    'password': 'test1234',
    'password_confirm': 'test1234',
    'first_name': '테스터',
    'last_name': '펌피',
    'phone': '010-9999-9999',
    'phone_verified': True,
    'terms_agreed': True,
    'privacy_agreed': True,
    'marketing_agreed': False
}

try:
    print(f"\n1. 회원가입 시도...")
    print(f"   Email: {signup_data['email']}")
    
    response = requests.post(
        f"{API_URL}/auth/register/",
        json=signup_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    
    print(f"\n   응답 상태: {response.status_code}")
    
    if response.status_code == 201:
        print("   ✅ 회원가입 성공!")
        result = response.json()
        print(f"   - 사용자 ID: {result.get('user', {}).get('id')}")
        print(f"   - 토큰: {result.get('token', '')[:50]}...")
    elif response.status_code == 400:
        error_msg = response.json().get('error', '')
        if '이미 사용 중인 이메일' in error_msg:
            print("   ℹ️  계정이 이미 존재합니다.")
        else:
            print(f"   ❌ 오류: {error_msg}")
    else:
        print(f"   ❌ 실패: {response.json()}")
    
    # 2. 로그인 테스트
    print(f"\n2. 로그인 테스트...")
    
    login_data = {
        'email': 'test@pumpy.com',
        'password': 'test1234'
    }
    
    response = requests.post(
        f"{API_URL}/auth/login/",
        json=login_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    
    print(f"   응답 상태: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ 로그인 성공!")
        result = response.json()
        user = result.get('user', {})
        print(f"   - 이름: {user.get('last_name', '')}{user.get('first_name', '')}")
        print(f"   - ID: {user.get('id')}")
        print(f"   - 상태: {user.get('status')}")
        print(f"\n💡 이제 앱에서 빈 칸으로 로그인하면 이 계정으로 자동 로그인됩니다!")
    else:
        print(f"   ❌ 로그인 실패: {response.json()}")
        
except requests.exceptions.RequestException as e:
    print(f"\n❌ 네트워크 오류: {e}")
except Exception as e:
    print(f"\n❌ 오류 발생: {e}")

print("=" * 60)

