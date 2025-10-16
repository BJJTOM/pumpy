from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import Post, Comment, Like, Story
from .serializers import PostSerializer, CommentSerializer, LikeSerializer, StorySerializer
import logging

logger = logging.getLogger(__name__)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Post.objects.all()
        member_id = self.request.query_params.get('member', None)
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """게시글 생성"""
        try:
            logger.info(f"게시글 생성 요청: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            post = serializer.save()
            logger.info(f"게시글 생성 성공: ID={post.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"게시글 생성 실패: {str(e)}")
            return Response({
                'error': '게시글 생성 실패',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_create(self, serializer):
        post = serializer.save()
        return post
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """게시물 좋아요"""
        post = self.get_object()
        member_id = request.data.get('member_id')
        
        if not member_id:
            return Response({'error': '회원 ID가 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
        
        like, created = Like.objects.get_or_create(
            post=post,
            member_id=member_id
        )
        
        if created:
            post.likes_count += 1
            post.save()
            return Response({'message': '좋아요!', 'likes_count': post.likes_count})
        else:
            like.delete()
            post.likes_count = max(0, post.likes_count - 1)
            post.save()
            return Response({'message': '좋아요 취소', 'likes_count': post.likes_count})
    
    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """댓글 작성"""
        post = self.get_object()
        member_id = request.data.get('member_id')
        content = request.data.get('content')
        
        if not member_id or not content:
            return Response({'error': '회원 ID와 내용이 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
        
        comment = Comment.objects.create(
            post=post,
            member_id=member_id,
            content=content
        )
        
        post.comments_count += 1
        post.save()
        
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        """게시물 저장"""
        post = self.get_object()
        member_id = request.data.get('member_id')
        
        if not member_id:
            return Response({'error': '회원 ID가 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
        
        saved, created = SavedPost.objects.get_or_create(
            post=post,
            member_id=member_id
        )
        
        if created:
            return Response({'message': '저장되었습니다'})
        else:
            saved.delete()
            return Response({'message': '저장 취소'})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Comment.objects.all()
        post_id = self.request.query_params.get('post', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset.order_by('created_at')


class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # 만료되지 않은 스토리만 반환
        now = timezone.now()
        queryset = Story.objects.filter(expires_at__gt=now)
        member_id = self.request.query_params.get('member', None)
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """스토리 조회수 증가"""
        story = self.get_object()
        story.views_count += 1
        story.save()
        return Response({'views_count': story.views_count})
    
    @action(detail=False, methods=['post'])
    def cleanup_expired(self, request):
        """만료된 스토리 삭제 (관리자용)"""
        now = timezone.now()
        deleted_count = Story.objects.filter(expires_at__lte=now).delete()[0]
        return Response({'deleted': deleted_count})


class LikeViewSet(viewsets.ReadOnlyModelViewSet):
    """좋아요 ViewSet"""
    queryset = Like.objects.all()
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Like.objects.all()
        post_id = self.request.query_params.get('post', None)
        member_id = self.request.query_params.get('member', None)
        
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        
        return queryset.order_by('-created_at')

