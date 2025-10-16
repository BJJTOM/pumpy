from django.db import models
from .models import Member

class Post(models.Model):
    """커뮤니티 게시물 (인스타그램 스타일)"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='posts')
    image = models.TextField(blank=True)  # Base64 이미지 또는 URL
    caption = models.TextField(blank=True)  # 게시물 내용
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes_count = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'community_posts'
    
    def __str__(self):
        return f"{self.member.first_name}의 게시물 - {self.created_at.strftime('%Y-%m-%d')}"


class Comment(models.Model):
    """게시물 댓글"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        db_table = 'community_comments'
    
    def __str__(self):
        return f"{self.member.first_name}의 댓글"


class Like(models.Model):
    """게시물 좋아요"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('post', 'member')
        db_table = 'community_likes'
    
    def __str__(self):
        return f"{self.member.first_name}이(가) 좋아요"


class Story(models.Model):
    """스토리 (24시간 후 자동 삭제)"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='stories')
    image = models.TextField()  # Base64 이미지 또는 URL
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    views_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'community_stories'
    
    def __str__(self):
        return f"{self.member.first_name}의 스토리"
    
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at


class SavedPost(models.Model):
    """저장된 게시물"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saved_by')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='saved_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('post', 'member')
        db_table = 'community_saved_posts'
    
    def __str__(self):
        return f"{self.member.first_name}이(가) 저장"


class Notification(models.Model):
    """알림"""
    TYPE_CHOICES = [
        ('like', '좋아요'),
        ('comment', '댓글'),
    ]
    
    recipient = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='notifications')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'community_notifications'
    
    def __str__(self):
        return f"{self.sender.first_name} → {self.recipient.first_name}: {self.get_notification_type_display()}"

