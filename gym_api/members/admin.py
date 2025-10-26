from django.contrib import admin
from config.admin import admin_site
from .models import (
    Gym, MembershipPlan, Member, Coach, WOD, Attendance,
    Post, Comment, Like, Notice, Banner, Story
)


@admin.register(Gym, site=admin_site)
@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'phone', 'created_at']
    search_fields = ['name', 'address']


@admin.register(Notice, site=admin_site)
@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ['title', 'gym', 'is_pinned', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_pinned', 'gym']
    search_fields = ['title', 'content']
    list_editable = ['is_pinned', 'is_active']


@admin.register(Banner, site=admin_site)
@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'gym', 'order', 'is_active', 'start_date', 'end_date']
    list_filter = ['is_active', 'gym']
    search_fields = ['title']
    list_editable = ['order', 'is_active']


@admin.register(Member, site=admin_site)
@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'gym', 'status', 'join_date']
    list_filter = ['status', 'gym']
    search_fields = ['first_name', 'last_name', 'email', 'phone']


@admin.register(MembershipPlan, site=admin_site)
@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'duration_days', 'is_active']
    list_filter = ['category', 'is_active']


@admin.register(Post, site=admin_site)
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'gym', 'is_gym_only', 'view_count', 'like_count', 'created_at']
    list_filter = ['category', 'is_gym_only', 'gym']
    search_fields = ['title', 'content']


@admin.register(Comment, site=admin_site)
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'content', 'created_at']
    search_fields = ['content']

