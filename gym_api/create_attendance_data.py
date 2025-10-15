import os
import sys
import django
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Django 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from members.models import Member, Attendance, Revenue, MembershipPlan

def create_attendance_data():
    print("Creating attendance data...")
    
    members = list(Member.objects.filter(status='active')[:100])
    
    if not members:
        print("No active members found!")
        return
    
    # 최근 30일간의 출석 데이터 생성
    today = datetime.now().date()
    
    attendance_count = 0
    for days_ago in range(30):
        date = today - timedelta(days=days_ago)
        
        # 매일 랜덤하게 30-50명 출석
        daily_members = random.sample(members, min(random.randint(30, 50), len(members)))
        
        for member in daily_members:
            # 하루에 1-2회 출석 (일부 회원은 아침/저녁 2번)
            sessions = random.randint(1, 2) if random.random() > 0.7 else 1
            
            for session in range(sessions):
                hour = random.choice([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])
                minute = random.choice([0, 15, 30, 45])
                time = f"{hour:02d}:{minute:02d}:00"
                
                Attendance.objects.get_or_create(
                    member=member,
                    date=date,
                    time=time,
                    defaults={'status': 'present'}
                )
                attendance_count += 1
                
                # 출석일수 업데이트
                if member.total_attendance_days is None:
                    member.total_attendance_days = 0
                member.total_attendance_days += 1
                member.last_visit_date = date
                member.last_visit_time = time
                member.save()
    
    print(f"+ Created {attendance_count} attendance records")

def create_revenue_data():
    print("\nCreating revenue data...")
    
    members = list(Member.objects.filter(status='active')[:50])
    plans = list(MembershipPlan.objects.all())
    
    if not members or not plans:
        print("No members or plans found!")
        return
    
    # 최근 3개월간의 수익 데이터 생성
    today = datetime.now().date()
    revenue_count = 0
    
    for days_ago in range(90):
        date = today - timedelta(days=days_ago)
        
        # 매일 1-3건의 결제
        daily_count = random.randint(1, 3)
        
        for _ in range(daily_count):
            member = random.choice(members)
            plan = random.choice(plans)
            
            # 할인율 (0-20%)
            discount_rate = random.choice([0, 0, 0, 5, 10, 15, 20])
            discount_value = int(float(plan.price) * discount_rate / 100)
            final_amount = float(plan.price) - discount_value
            
            Revenue.objects.create(
                member=member,
                date=date,
                amount=final_amount,
                source=random.choice(['카드', '현금', '계좌이체']),
                memo=f"{plan.name} 결제 (할인: {discount_rate}%)" if discount_rate > 0 else f"{plan.name} 결제"
            )
            revenue_count += 1
    
    print(f"+ Created {revenue_count} revenue records")

if __name__ == '__main__':
    print("=" * 60)
    print("COCO Gym - Attendance & Revenue Data Generator")
    print("=" * 60)
    
    create_attendance_data()
    create_revenue_data()
    
    print("\n" + "=" * 60)
    print("Data creation completed!")
    print("=" * 60)

