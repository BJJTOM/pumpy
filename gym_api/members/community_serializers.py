from rest_framework import serializers
from .models import Post, Comment, Like, Story, Member

class MemberBriefSerializer(serializers.ModelSerializer):
    """회원 간단 정보"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Member
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email', 'photo']
    
    def get_full_name(self, obj):
        return f"{obj.last_name}{obj.first_name}"


class CommentSerializer(serializers.ModelSerializer):
    """댓글 시리얼라이저 - 답글 지원"""
    author = MemberBriefSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True, source='author.id', required=False)
    replies = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'author_id', 'parent', 
            'content', 'like_count', 'replies', 'reply_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'like_count', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """답글 목록 (최대 3개)"""
        if obj.parent:  # 답글에는 답글 목록 없음
            return []
        replies = obj.replies.select_related('author').order_by('created_at')[:3]
        return CommentSerializer(replies, many=True, context=self.context).data
    
    def get_reply_count(self, obj):
        """답글 개수"""
        if obj.parent:
            return 0
        return obj.replies.count()


class PostSerializer(serializers.ModelSerializer):
    """게시글 시리얼라이저 - 영상, 이미지, 검색 지원"""
    author = MemberBriefSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True, source='author.id', required=False)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_id', 'gym', 'category', 'title', 'content',
            'images', 'video_url', 'video_duration',
            'like_count', 'comment_count', 'share_count', 'view_count',
            'is_pinned', 'is_public',
            'created_at', 'updated_at', 'is_liked'
        ]
        read_only_fields = ['id', 'like_count', 'comment_count', 'share_count', 'view_count', 'created_at', 'updated_at']
    
    def get_is_liked(self, obj):
        """현재 사용자가 좋아요를 눌렀는지"""
        request = self.context.get('request')
        if request:
            member_id = request.query_params.get('member_id') or request.data.get('member_id')
            if member_id:
                return Like.objects.filter(post=obj, member_id=member_id).exists()
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


class LikeSerializer(serializers.ModelSerializer):
    """좋아요 시리얼라이저"""
    member = MemberBriefSerializer(read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'member', 'post', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']










