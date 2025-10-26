import os
import sys
import django

# Django 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command

print("=" * 60)
print("마이그레이션 생성 중...")
print("=" * 60)

try:
    call_command('makemigrations', 'members')
    print("\n✅ 마이그레이션 생성 완료!")
    print("\n다음 단계:")
    print("1. python manage.py migrate")
    print("2. 서버 재시작: sudo systemctl restart gunicorn")
except Exception as e:
    print(f"\n❌ 오류 발생: {e}")

print("=" * 60)

