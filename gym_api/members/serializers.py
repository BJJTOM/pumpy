from rest_framework import serializers
from .models import (Member, MembershipPlan, Subscription, Coupon, Revenue, 
                     Attendance, Locker, Coach, WOD, MemberNote, LevelHistory,
                     UserProfile, WorkoutLog, MealLog, Post, Comment, Like,
                     Story, ChatRoom, ChatMessage, Notification)


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = '__all__'


class MemberSerializer(serializers.ModelSerializer):
    days_until_expire = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Member
        fields = '__all__'


class MemberListSerializer(serializers.ModelSerializer):
    """회원 목록용 간소화된 Serializer"""
    days_until_expire = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    name = serializers.SerializerMethodField()
    
    def get_name(self, obj):
        return obj.full_name
    
    class Meta:
        model = Member
        fields = ['id', 'first_name', 'last_name', 'full_name', 'name', 'phone', 'email', 
                  'status', 'expire_date', 'days_until_expire', 'current_level', 'join_date',
                  'total_attendance_days', 'points', 'notes']


class SubscriptionSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class RevenueSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    
    class Meta:
        model = Revenue
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'


class LockerSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    
    class Meta:
        model = Locker
        fields = '__all__'


class CoachSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coach
        fields = '__all__'


class WODSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.name', read_only=True)
    
    class Meta:
        model = WOD
        fields = '__all__'


class MemberNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberNote
        fields = '__all__'


class LevelHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelHistory
        fields = '__all__'


# 회원용 앱 Serializers
class UserProfileSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'


class WorkoutLogSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    wod_title = serializers.CharField(source='wod.title', read_only=True)
    
    class Meta:
        model = WorkoutLog
        fields = '__all__'


class MealLogSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    
    class Meta:
        model = MealLog
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    
    class Meta:
        model = Comment
        fields = '__all__'


class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ('like_count', 'comment_count', 'share_count', 'view_count', 'created_at', 'updated_at')


class LikeSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    
    class Meta:
        model = Like
        fields = '__all__'


class StorySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    
    class Meta:
        model = Story
        fields = '__all__'


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = '__all__'


class ChatRoomSerializer(serializers.ModelSerializer):
    last_message_data = ChatMessageSerializer(source='chatmessage_set.first', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    class Meta:
        model = ChatRoom
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
