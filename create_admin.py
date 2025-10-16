#!/usr/bin/env python
"""
Django 관리자 계정 자동 생성 스크립트
"""
import os
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

# 관리자 계정 정보
username = 'admin'
email = 'admin@pumpy.com'
password = 'Pumpy2025!@'

# 기존 계정 확인
if User.objects.filter(username=username).exists():
    print(f'✅ 관리자 계정 "{username}"이 이미 존재합니다.')
    user = User.objects.get(username=username)
    # 비밀번호 업데이트
    user.set_password(password)
    user.save()
    print(f'✅ 비밀번호가 업데이트되었습니다.')
else:
    # 새 관리자 계정 생성
    User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print(f'✅ 관리자 계정이 생성되었습니다!')

print('')
print('=' * 60)
print('  🎉 Django 관리자 계정 정보')
print('=' * 60)
print(f'  Username: {username}')
print(f'  Email:    {email}')
print(f'  Password: {password}')
print('')
print('  관리자 페이지: http://3.27.28.175/admin/')
print('=' * 60)


