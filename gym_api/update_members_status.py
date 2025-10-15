import os
import sys
import django
from datetime import datetime, timedelta
import random

# Django 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from members.models import Member, MembershipPlan

print("=" * 60)
print("Updating member statuses and adding subscriptions...")
print("=" * 60)

# 모든 회원 가져오기
members = list(Member.objects.all())
plans = list(MembershipPlan.objects.all())

if not members:
    print("No members found!")
    exit()

if not plans:
    print("No plans found!")
    exit()

today = datetime.now().date()
active_count = 0
paused_count = 0
cancelled_count = 0

for member in members[:350]:  # 350명을 활성 회원으로
    member.status = 'active'
    plan = random.choice(plans)
    member.current_plan = plan
    
    # 가입일로부터 랜덤한 기간 설정 (1-360일 전)
    days_since_join = random.randint(1, 360)
    start_date = today - timedelta(days=days_since_join)
    
    # 만료일 설정 (30, 60, 90, 180일 후)
    duration = random.choice([30, 60, 90, 180])
    member.expire_date = start_date + timedelta(days=duration)
    
    # 일부 회원은 곧 만료
    if random.random() < 0.1:  # 10%는 7일 이내 만료
        member.expire_date = today + timedelta(days=random.randint(1, 7))
    elif random.random() < 0.05:  # 5%는 이미 만료
        member.expire_date = today - timedelta(days=random.randint(1, 30))
    
    # 잔여 횟수 설정 (횟수권인 경우)
    if '회' in plan.name:
        member.remaining_visits = random.randint(1, 20)
    else:
        member.remaining_visits = None
    
    # 출석일수 설정
    member.total_attendance_days = random.randint(5, 100)
    
    # 포인트 설정
    member.points = random.randint(0, 5000)
    
    # 레벨 설정
    member.current_level = random.choice(['화이트', '블루', '퍼플', '브라운', '블랙', '초급', '중급', '고급', '1단', '2단'])
    
    member.save()
    active_count += 1

# 일부 회원을 정지 상태로
for member in members[350:370]:
    member.status = 'paused'
    member.save()
    paused_count += 1

# 일부 회원을 해지 상태로
for member in members[370:400]:
    member.status = 'cancelled'
    member.save()
    cancelled_count += 1

print(f"+ Active members: {active_count}")
print(f"+ Paused members: {paused_count}")
print(f"+ Cancelled members: {cancelled_count}")
print(f"+ Total: {active_count + paused_count + cancelled_count}")

print("\n" + "=" * 60)
print("Update completed!")
print("=" * 60)

