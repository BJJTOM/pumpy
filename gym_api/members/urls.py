from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

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

# 회원용 앱 API
router.register(r'app/profiles', views.UserProfileViewSet, basename='app-profiles')
router.register(r'app/workout-logs', views.WorkoutLogViewSet, basename='app-workout-logs')
router.register(r'app/meal-logs', views.MealLogViewSet, basename='app-meal-logs')
router.register(r'app/posts', views.PostViewSet, basename='app-posts')
router.register(r'app/comments', views.CommentViewSet, basename='app-comments')
router.register(r'app/stories', views.StoryViewSet, basename='app-stories')
router.register(r'app/chatrooms', views.ChatRoomViewSet, basename='app-chatrooms')
router.register(r'app/messages', views.ChatMessageViewSet, basename='app-messages')
router.register(r'app/notifications', views.NotificationViewSet, basename='app-notifications')

urlpatterns = [
    path('', include(router.urls)),
    path('public/signup/', views.public_signup, name='public-signup'),
    path('pending-members/', views.pending_members, name='pending-members'),
]
