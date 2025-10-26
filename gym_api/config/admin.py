from django.contrib import admin
from members.admin_auth import CustomAdminAuthenticationForm

# 커스텀 Admin 사이트
class CustomAdminSite(admin.AdminSite):
    site_header = '💪 Pumpy Gym 관리자'
    site_title = 'Pumpy 관리자'
    index_title = '펌피 체육관 관리'
    login_form = CustomAdminAuthenticationForm
    
    def has_permission(self, request):
        """
        관리자 권한 체크 - 로그인 실패 시 상세 메시지 표시
        """
        return request.user.is_active and request.user.is_staff

# 기본 admin 사이트를 커스텀 사이트로 교체
admin_site = CustomAdminSite(name='custom_admin')

