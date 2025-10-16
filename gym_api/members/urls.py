from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import auth_views
from . import community_views

router = DefaultRouter()
# 관리자용 API
router.register(r'members', views.MemberViewSet)
router.register(r'plans', views.MembershipPlanViewSet)
router.register(r'subscriptions', views.SubscriptionViewSet)
router.register(r'coupons', views.CouponViewSet)
router.register(r'revenue', views.RevenueViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'lockers', views.LockerViewSet)
router.register(r'coaches', views.CoachViewSet)
router.register(r'wods', views.WODViewSet)
router.register(r'member-notes', views.MemberNoteViewSet, basename='member-notes')
router.register(r'level-history', views.LevelHistoryViewSet, basename='level-history')

# 커뮤니티 API (인스타그램 스타일)
router.register(r'posts', community_views.PostViewSet, basename='posts')
router.register(r'comments', community_views.CommentViewSet, basename='comments')
router.register(r'stories', community_views.StoryViewSet, basename='stories')
router.register(r'likes', community_views.LikeViewSet, basename='likes')

# 회원용 앱 API (기존)
router.register(r'app/profiles', views.UserProfileViewSet, basename='app-profiles')
router.register(r'app/workout-logs', views.WorkoutLogViewSet, basename='app-workout-logs')
router.register(r'app/meal-logs', views.MealLogViewSet, basename='app-meal-logs')
router.register(r'app/chatrooms', views.ChatRoomViewSet, basename='app-chatrooms')
router.register(r'app/messages', views.ChatMessageViewSet, basename='app-messages')
router.register(r'app/notifications', views.NotificationViewSet, basename='app-notifications')

urlpatterns = [
    path('', include(router.urls)),
    path('public/signup/', views.public_signup, name='public-signup'),
    path('pending-members/', views.pending_members, name='pending-members'),
    
    # 인증 API
    path('auth/register/', auth_views.register, name='auth-register'),
    path('auth/login/', auth_views.login, name='auth-login'),
    path('auth/send-verification/', auth_views.send_verification_code, name='auth-send-verification'),
    path('auth/verify-phone/', auth_views.verify_phone, name='auth-verify-phone'),
    path('auth/reset-password/', auth_views.reset_password_request, name='auth-reset-password'),
    path('auth/reset-password-confirm/', auth_views.reset_password_confirm, name='auth-reset-password-confirm'),
    path('auth/check-email/', auth_views.check_email, name='auth-check-email'),
]
