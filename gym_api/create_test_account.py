import os
import sys
import django
from django.contrib.auth.hashers import make_password

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from members.models import Member, MembershipPlan
from datetime import date, timedelta

# 테스트 계정 생성
email = 'test@pumpy.com'
password = 'test1234'

# 기존 계정 확인
existing = Member.objects.filter(email=email).first()
if existing:
    print(f"✅ 테스트 계정이 이미 존재합니다: {email}")
    print(f"   - 이름: {existing.last_name}{existing.first_name}")
    print(f"   - 상태: {existing.status}")
    
    # 비밀번호 업데이트
    existing.password = make_password(password)
    existing.status = 'active'
    existing.save()
    print(f"   - 비밀번호 업데이트 완료!")
else:
    # 멤버십 플랜 가져오기 (없으면 기본 플랜 생성)
    plan = MembershipPlan.objects.first()
    if not plan:
        plan = MembershipPlan.objects.create(
            name='기본 플랜',
            price=100000,
            duration_days=30,
            description='기본 멤버십 플랜'
        )
        print(f"✅ 기본 멤버십 플랜 생성 완료")
    
    # 테스트 계정 생성
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
    print(f"   - 이름: {member.last_name}{member.first_name}")

print("\n💡 앱에서 빈 칸으로 로그인하면 이 계정으로 자동 로그인됩니다.")

