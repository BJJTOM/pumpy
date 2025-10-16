import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from members.models import Member, MembershipPlan, Attendance, Revenue

print("=" * 60)
print("DATABASE STATUS")
print("=" * 60)
print(f"Members: {Member.objects.count()}")
print(f"Plans: {MembershipPlan.objects.count()}")
print(f"Attendance: {Attendance.objects.count()}")
print(f"Revenue: {Revenue.objects.count()}")
print("=" * 60)

# 회원 상태별 카운트
print("\nMember Status:")
print(f"  Active: {Member.objects.filter(status='active').count()}")
print(f"  Paused: {Member.objects.filter(status='paused').count()}")
print(f"  Cancelled: {Member.objects.filter(status='cancelled').count()}")
print(f"  Pending: {Member.objects.filter(status='pending').count()}")
print("=" * 60)



