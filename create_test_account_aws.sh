#!/bin/bash

# AWS 서버에서 테스트 계정 생성

cd /home/ubuntu/gym_api

# Django shell에서 테스트 계정 생성
python3 manage.py shell <<EOF
from members.models import Member, MembershipPlan
from django.contrib.auth.hashers import make_password, check_password
from datetime import date, timedelta

print("=" * 60)
print("테스트 계정 생성/업데이트")
print("=" * 60)

email = 'test@pumpy.com'
password = 'test1234'

try:
    # 기본 멤버십 플랜 확인 또는 생성
    plan, created = MembershipPlan.objects.get_or_create(
        name='기본 멤버십',
        defaults={
            'category': '일반',
            'price': 30000,
            'original_price': 50000,
            'duration_days': 30,
            'description': '기본 멤버십 플랜'
        }
    )
    if created:
        print("✅ 기본 멤버십 플랜 생성 완료")
    else:
        print("✅ 기본 멤버십 플랜 이미 존재")

    # 테스트 계정 확인 또는 생성
    try:
        member = Member.objects.get(email=email)
        print(f"✅ 테스트 계정 발견: {email}")
        print(f"   - 이름: {member.last_name}{member.first_name}")
        print(f"   - 상태: {member.status}")
        
        # 비밀번호 재설정
        member.password = make_password(password)
        member.current_plan = plan
        member.expire_date = date.today() + timedelta(days=365)
        member.status = 'active'
        member.save()
        print(f"   - 비밀번호 업데이트 완료!")
        
        # 비밀번호 검증
        if check_password(password, member.password):
            print(f"   - ✅ 비밀번호 검증 성공!")
        else:
            print(f"   - ❌ 비밀번호 검증 실패!")
            
    except Member.DoesNotExist:
        member = Member.objects.create(
            email=email,
            password=make_password(password),
            first_name='테스터',
            last_name='펌피',
            phone='010-1234-5678',
            phone_verified=True,
            email_verified=True,
            status='active',
            gender='남',
            birth_date=date(1990, 1, 1),
            address='서울시 강남구',
            current_plan=plan,
            expire_date=date.today() + timedelta(days=365)
        )
        print(f"✅ 테스트 계정 생성 완료!")
        print(f"   - 이메일: {email}")
        print(f"   - 비밀번호: {password}")

    print("\\n💡 앱에서 빈 칸으로 로그인하면 이 계정으로 자동 로그인됩니다.")
    print("=" * 60)

except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()
EOF

echo ""
echo "✅ 완료! 이제 앱에서 로그인을 시도해보세요."

