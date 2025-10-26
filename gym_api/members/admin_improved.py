"""
Pumpy Gym - 개선된 Django Admin 설정
첨부하신 이미지처럼 깔끔하고 사용하기 편리한 관리자 페이지
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Gym, MembershipPlan, Member, Coach, WOD, Attendance,
    Post, Comment, Like, Notice, Banner, Story, Subscription,
    Revenue, Coupon, Locker
)


# ============================================
# 커스텀 Admin Site
# ============================================
class PumpyAdminSite(admin.AdminSite):
    site_header = "💪 Pumpy Gym 관리 시스템"
    site_title = "Pumpy Admin"
    index_title = "펌피 체육관 관리자 대시보드"
    
    def each_context(self, request):
        context = super().each_context(request)
        context.update({
            'site_header': self.site_header,
            'site_title': self.site_title,
            'index_title': self.index_title,
        })
        return context


# 커스텀 Admin 사이트 인스턴스
pumpy_admin_site = PumpyAdminSite(name='pumpy_admin')


# ============================================
# 체육관 정보
# ============================================
@admin.register(Gym, site=pumpy_admin_site)
class GymAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'phone', 'member_count', 'created_at']
    search_fields = ['name', 'address', 'phone']
    list_filter = ['created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'address', 'phone')
        }),
        ('상세 정보', {
            'fields': ('description', 'logo')
        }),
        ('시스템 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def member_count(self, obj):
        count = obj.members.count()
        return format_html('<strong>{}</strong> 명', count)
    member_count.short_description = '회원 수'


# ============================================
# 회원권 관리
# ============================================
@admin.register(MembershipPlan, site=pumpy_admin_site)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'formatted_price', 'duration_display', 'is_active', 'total_sales']
    list_filter = ['category', 'is_active', 'is_popular']
    search_fields = ['name', 'description']
    list_editable = ['is_active']
    ordering = ['display_order', '-is_popular', 'category']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'category', 'price', 'original_price')
        }),
        ('기간 및 횟수', {
            'fields': ('duration_days', 'duration_months', 'visits', 'period_type', 'weekly_limit')
        }),
        ('할인 정책', {
            'fields': ('discount_rate', 'continuous_discount', 'family_discount')
        }),
        ('포함 사항', {
            'fields': ('includes_uniform', 'includes_rashguard', 'includes_locker', 'includes_towel', 'includes_gear')
        }),
        ('수업 정보', {
            'fields': ('class_times', 'description', 'notes')
        }),
        ('표시 설정', {
            'fields': ('is_active', 'is_popular', 'display_order')
        }),
        ('통계', {
            'fields': ('total_sales', 'active_users'),
            'classes': ('collapse',)
        }),
    )
    
    def formatted_price(self, obj):
        return format_html('<strong>₩{:,}</strong>', obj.price)
    formatted_price.short_description = '가격'
    
    def duration_display(self, obj):
        if obj.duration_months:
            return f"{obj.duration_months}개월"
        elif obj.duration_days:
            return f"{obj.duration_days}일"
        return "-"
    duration_display.short_description = '기간'


# ============================================
# 회원 관리
# ============================================
@admin.register(Member, site=pumpy_admin_site)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['member_display', 'phone', 'email', 'gym', 'status_badge', 'current_plan', 'join_date', 'days_until_expire']
    list_filter = ['status', 'gym', 'is_approved', 'gender', 'current_level']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'member_number']
    list_per_page = 50
    date_hierarchy = 'join_date'
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('first_name', 'last_name', 'phone', 'email', 'member_number')
        }),
        ('소속 정보', {
            'fields': ('gym', 'status', 'is_approved')
        }),
        ('개인 정보', {
            'fields': ('gender', 'birth_date', 'address', 'photo')
        }),
        ('회원권 정보', {
            'fields': ('current_plan', 'expire_date', 'remaining_visits')
        }),
        ('운동 정보', {
            'fields': ('current_level', 'level_date'),
            'classes': ('collapse',)
        }),
        ('출석 정보', {
            'fields': ('total_attendance_days', 'last_visit_date', 'last_visit_time'),
            'classes': ('collapse',)
        }),
        ('기타', {
            'fields': ('points', 'notes', 'medical_notes'),
            'classes': ('collapse',)
        }),
    )
    
    def member_display(self, obj):
        return format_html('<strong>{}</strong>', obj.full_name)
    member_display.short_description = '회원명'
    
    def status_badge(self, obj):
        colors = {
            'active': 'green',
            'pending': 'orange',
            'paused': 'gray',
            'cancelled': 'red'
        }
        color = colors.get(obj.status, 'gray')
        status_text = {
            'active': '활성',
            'pending': '대기',
            'paused': '정지',
            'cancelled': '해지'
        }.get(obj.status, obj.status)
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, status_text
        )
    status_badge.short_description = '상태'


# ============================================
# 게시글 관리
# ============================================
@admin.register(Post, site=pumpy_admin_site)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'gym', 'visibility_badge', 'view_count', 'like_count', 'comment_count', 'created_at']
    list_filter = ['category', 'is_gym_only', 'gym', 'is_pinned']
    search_fields = ['title', 'content', 'author__first_name', 'author__last_name']
    date_hierarchy = 'created_at'
    readonly_fields = ['view_count', 'like_count', 'comment_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('게시글 정보', {
            'fields': ('title', 'author', 'category')
        }),
        ('내용', {
            'fields': ('content', 'images', 'video_url', 'video_duration')
        }),
        ('공개 설정', {
            'fields': ('gym', 'is_gym_only', 'is_pinned')
        }),
        ('통계', {
            'fields': ('view_count', 'like_count', 'comment_count'),
            'classes': ('collapse',)
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def visibility_badge(self, obj):
        if obj.is_gym_only:
            return format_html(
                '<span style="background-color: #3b82f6; color: white; padding: 3px 10px; border-radius: 3px;">🏋️ 체육관 전용</span>'
            )
        return format_html(
            '<span style="background-color: #10b981; color: white; padding: 3px 10px; border-radius: 3px;">🌍 전체 공개</span>'
        )
    visibility_badge.short_description = '공개 범위'


# ============================================
# 댓글 관리
# ============================================
@admin.register(Comment, site=pumpy_admin_site)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['content_preview', 'author', 'post', 'parent', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__first_name', 'author__last_name']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = '댓글 내용'


# ============================================
# 공지사항 관리
# ============================================
@admin.register(Notice, site=pumpy_admin_site)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ['title', 'gym', 'priority_badge', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_pinned', 'gym']
    search_fields = ['title', 'content']
    list_editable = ['is_active']
    
    def priority_badge(self, obj):
        if obj.is_pinned:
            return format_html(
                '<span style="background-color: #ef4444; color: white; padding: 3px 10px; border-radius: 3px;">📌 고정</span>'
            )
        return format_html(
            '<span style="background-color: #94a3b8; color: white; padding: 3px 10px; border-radius: 3px;">일반</span>'
        )
    priority_badge.short_description = '우선순위'


# ============================================
# 배너 관리
# ============================================
@admin.register(Banner, site=pumpy_admin_site)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'gym', 'order', 'period_display', 'is_active']
    list_filter = ['is_active', 'gym']
    search_fields = ['title']
    list_editable = ['order', 'is_active']
    
    def period_display(self, obj):
        if obj.start_date and obj.end_date:
            return f"{obj.start_date} ~ {obj.end_date}"
        return "무제한"
    period_display.short_description = '게시 기간'


# ============================================
# 출석 관리
# ============================================
@admin.register(Attendance, site=pumpy_admin_site)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'time', 'status']
    list_filter = ['status', 'date']
    search_fields = ['member__first_name', 'member__last_name']
    date_hierarchy = 'date'


# ============================================
# 기타 모델 등록
# ============================================
@admin.register(Subscription, site=pumpy_admin_site)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['member', 'plan', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active', 'approval_status']
    search_fields = ['member__first_name', 'member__last_name']


@admin.register(Revenue, site=pumpy_admin_site)
class RevenueAdmin(admin.ModelAdmin):
    list_display = ['member', 'amount', 'date', 'source']
    list_filter = ['date', 'source']
    search_fields = ['member__first_name', 'member__last_name']


@admin.register(Coupon, site=pumpy_admin_site)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_percent', 'discount_amount', 'valid_from', 'valid_until', 'is_active']
    list_filter = ['is_active', 'valid_from', 'valid_until']
    search_fields = ['code']


@admin.register(Coach, site=pumpy_admin_site)
class CoachAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialty', 'phone', 'email']
    search_fields = ['name', 'phone', 'email']


@admin.register(WOD, site=pumpy_admin_site)
class WODAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'time_start', 'category', 'level']
    list_filter = ['category', 'level', 'date']
    search_fields = ['title', 'description']


@admin.register(Locker, site=pumpy_admin_site)
class LockerAdmin(admin.ModelAdmin):
    list_display = ['no', 'member', 'start_date', 'expire_date', 'is_available']
    list_filter = ['is_available']
    search_fields = ['no', 'member__first_name', 'member__last_name']


# ============================================
# 기본 Django 모델도 등록
# ============================================
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin, GroupAdmin

pumpy_admin_site.register(User, UserAdmin)
pumpy_admin_site.register(Group, GroupAdmin)

