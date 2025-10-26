import requests
import json

# 서버 URL
API_URL = 'http://3.27.28.175/api'

print("=" * 60)
print("테스트 계정으로 로그인 테스트")
print("=" * 60)

# 테스트 계정 정보
test_data = {
    'email': 'test@pumpy.com',
    'password': 'test1234'
}

try:
    print(f"\n로그인 시도:")
    print(f"  Email: {test_data['email']}")
    print(f"  Password: {test_data['password']}")
    print(f"  URL: {API_URL}/auth/login/")
    
    response = requests.post(
        f"{API_URL}/auth/login/",
        json=test_data,
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    
    print(f"\n응답 상태 코드: {response.status_code}")
    print(f"응답 내용:")
    print(json.dumps(response.json(), ensure_ascii=False, indent=2))
    
    if response.status_code == 200:
        print("\n✅ 로그인 성공!")
        user = response.json().get('user', {})
        print(f"  - 이름: {user.get('last_name', '')}{user.get('first_name', '')}")
        print(f"  - ID: {user.get('id')}")
        print(f"  - 토큰: {response.json().get('token', '')[:50]}...")
    else:
        print("\n❌ 로그인 실패!")
        
except requests.exceptions.RequestException as e:
    print(f"\n❌ 네트워크 오류: {e}")
except Exception as e:
    print(f"\n❌ 오류 발생: {e}")

print("=" * 60)

