from rest_framework import serializers
from .community_models import Post, Comment, Like, Story, SavedPost
from .models import Member

class MemberBriefSerializer(serializers.ModelSerializer):
    """회원 간단 정보"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Member
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email']
    
    def get_full_name(self, obj):
        return f"{obj.last_name}{obj.first_name}"


class CommentSerializer(serializers.ModelSerializer):
    member = MemberBriefSerializer(read_only=True)
    member_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'member', 'member_id', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    member = MemberBriefSerializer(read_only=True)
    member_id = serializers.IntegerField(write_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'member', 'member_id', 'image', 'caption',
            'likes_count', 'comments_count', 'created_at', 'updated_at',
            'comments', 'is_liked', 'is_saved'
        ]
        read_only_fields = ['id', 'likes_count', 'comments_count', 'created_at', 'updated_at']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            # 실제로는 현재 로그인한 회원 확인 필요
            return False
        return False
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return False
        return False


class StorySerializer(serializers.ModelSerializer):
    member = MemberBriefSerializer(read_only=True)
    member_id = serializers.IntegerField(write_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Story
        fields = [
            'id', 'member', 'member_id', 'image', 'text',
            'views_count', 'created_at', 'expires_at', 'is_expired'
        ]
        read_only_fields = ['id', 'views_count', 'created_at', 'expires_at']
    
    def create(self, validated_data):
        from django.utils import timezone
        from datetime import timedelta
        validated_data['expires_at'] = timezone.now() + timedelta(hours=24)
        return super().create(validated_data)


class SavedPostSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    post_id = serializers.IntegerField(write_only=True)
    member_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = SavedPost
        fields = ['id', 'post', 'post_id', 'member', 'member_id', 'created_at']
        read_only_fields = ['id', 'created_at']





