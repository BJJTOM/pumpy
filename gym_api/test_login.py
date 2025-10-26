import os
import sys
import django
from django.contrib.auth.hashers import make_password, check_password

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from members.models import Member

# 테스트 계정 확인
email = 'test@pumpy.com'
password = 'test1234'

print("=" * 60)
print("테스트 계정 확인")
print("=" * 60)

try:
    member = Member.objects.get(email=email)
    print(f"✅ 계정 존재: {email}")
    print(f"   - ID: {member.id}")
    print(f"   - 이름: {member.last_name}{member.first_name}")
    print(f"   - 상태: {member.status}")
    print(f"   - 전화번호: {member.phone}")
    
    # 비밀번호 확인
    if member.password:
        is_correct = check_password(password, member.password)
        print(f"\n   - 저장된 비밀번호 해시: {member.password[:50]}...")
        print(f"   - 비밀번호 검증 결과: {'✅ 일치' if is_correct else '❌ 불일치'}")
        
        if not is_correct:
            print(f"\n⚠️ 비밀번호가 일치하지 않습니다. 재설정합니다...")
            member.password = make_password(password)
            member.save()
            print(f"✅ 비밀번호가 '{password}'로 재설정되었습니다.")
            
            # 재확인
            is_correct = check_password(password, member.password)
            print(f"   - 재검증 결과: {'✅ 일치' if is_correct else '❌ 여전히 불일치'}")
    else:
        print(f"\n⚠️ 비밀번호가 설정되지 않았습니다. 설정합니다...")
        member.password = make_password(password)
        member.save()
        print(f"✅ 비밀번호가 '{password}'로 설정되었습니다.")

except Member.DoesNotExist:
    print(f"❌ 계정이 존재하지 않습니다: {email}")
    print(f"\n계정을 생성합니다...")
    
    member = Member.objects.create(
        email=email,
        password=make_password(password),
        first_name='테스터',
        last_name='펌피',
        phone='010-1234-5678',
        phone_verified=True,
        email_verified=True,
        status='active',
        gender='남'
    )
    print(f"✅ 테스트 계정이 생성되었습니다.")
    print(f"   - 이메일: {email}")
    print(f"   - 비밀번호: {password}")

print("=" * 60)
print("✅ 테스트 계정 준비 완료!")
print(f"\n로그인 정보:")
print(f"  이메일: {email}")
print(f"  비밀번호: {password}")
print("=" * 60)

