"""
Django Admin Interface 테마 설정 스크립트
첨부하신 이미지처럼 오렌지/피치 색상의 깔끔한 관리자 페이지를 만듭니다.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from admin_interface.models import Theme

print("=" * 60)
print("💪 Pumpy Gym Admin 테마 설정 중...")
print("=" * 60)

# 기존 테마 삭제
Theme.objects.all().delete()
print("✓ 기존 테마 삭제 완료")

# 새로운 테마 생성 (첨부된 이미지 스타일)
theme = Theme.objects.create(
    name="Pumpy Orange Theme",
    active=True,
    
    # 타이틀
    title="💪 Pumpy Gym 관리자",
    title_visible=True,
    
    # 색상 설정 (오렌지/피치 톤)
    css_header_background_color="#FF9966",  # 오렌지
    css_header_text_color="#FFFFFF",
    css_header_link_color="#FFFFFF",
    css_header_link_hover_color="#FFE5D9",
    
    # 사이드바 (이미지처럼 오렌지 계열)
    css_module_background_color="#FFB380",
    css_module_text_color="#FFFFFF",
    css_module_link_color="#FFFFFF",
    css_module_link_hover_color="#FFE5D9",
    
    css_module_rounded_corners=True,
    
    # 일반 링크
    css_generic_link_color="#667eea",
    css_generic_link_hover_color="#4f5bd5",
    
    # 버튼 색상
    css_save_button_background_color="#667eea",
    css_save_button_background_hover_color="#4f5bd5",
    css_save_button_text_color="#FFFFFF",
    
    css_delete_button_background_color="#ef4444",
    css_delete_button_background_hover_color="#dc2626",
    css_delete_button_text_color="#FFFFFF",
    
    # 테이블 스타일
    list_filter_dropdown=True,
    related_modal_active=True,
    related_modal_background_color="#F5F5F5",
    related_modal_rounded_corners=True,
    
    # Recent Actions
    recent_actions_visible=True,
)

print(f"✓ 새로운 테마 생성 완료: {theme.name}")
print()
print("=" * 60)
print("✅ Admin 테마 설정 완료!")
print("=" * 60)
print()
print("🎨 적용된 색상:")
print(f"  - 헤더: 오렌지 (#FF9966)")
print(f"  - 사이드바: 라이트 오렌지 (#FFB380)")
print(f"  - 버튼: 퍼플 (#667eea)")
print()
print("💡 브라우저를 새로고침하면 새로운 테마가 적용됩니다!")
print()

