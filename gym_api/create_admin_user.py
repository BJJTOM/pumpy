import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

email = 'admin@pumpy.com'
username = 'admin'
password = 'pumpy2025!'

try:
    # 기존 관리자 확인
    admin = User.objects.get(username=username)
    admin.set_password(password)
    admin.is_staff = True
    admin.is_superuser = True
    admin.is_active = True
    admin.email = email
    admin.save()
    print('✓ 관리자 계정 업데이트 완료')
except User.DoesNotExist:
    # 새 관리자 생성
    admin = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print('✓ 관리자 계정 생성 완료')

print('')
print('========================================')
print('관리자 페이지 접속 정보')
print('========================================')
print(f'URL: http://3.27.28.175/admin/')
print(f'Username: {username}')
print(f'Email: {email}')
print(f'Password: {password}')
print('========================================')
print('')
print('💡 이제 위 정보로 관리자 페이지에 로그인할 수 있습니다!')
print('   Username 또는 Email 둘 다 사용 가능합니다.')
print('========================================')

