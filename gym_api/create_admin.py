import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from members.models import Member
from django.contrib.auth.hashers import make_password

email = 'admin@pumpy.com'
password = 'pumpy2025!'

try:
    admin = Member.objects.get(email=email)
    admin.is_staff = True
    admin.is_superuser = True
    admin.password = make_password(password)
    admin.save()
    print('✓ 관리자 계정 업데이트 완료')
except Member.DoesNotExist:
    admin = Member.objects.create(
        email=email,
        first_name='관리자',
        last_name='Pumpy',
        phone='010-0000-0000',
        is_staff=True,
        is_superuser=True,
        phone_verified=True,
        email_verified=True,
        status='active',
        is_approved=True,
        password=make_password(password)
    )
    admin.save()
    print('✓ 관리자 계정 생성 완료')

print('')
print('========================================')
print('관리자 페이지 접속 정보')
print('========================================')
print(f'URL: http://3.27.28.175/admin/')
print(f'Email: {email}')
print(f'Password: {password}')
print('========================================')

