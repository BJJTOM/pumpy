import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

username = 'admin'
email = 'admin@pumpy.com'
password = 'pumpy2025!'

try:
    # 기존 계정 삭제
    User.objects.filter(username=username).delete()
    print('기존 admin 계정 삭제 완료')
except:
    pass

# 새 슈퍼유저 생성
user = User.objects.create_superuser(
    username=username,
    email=email,
    password=password
)

print('\n========================================')
print('관리자 계정 생성 완료!')
print('========================================')
print(f'URL: http://localhost:8000/admin/')
print(f'Username: {username}')
print(f'Password: {password}')
print('========================================\n')

