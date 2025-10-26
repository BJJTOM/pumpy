"""
커뮤니티 API v2 - 고도화 버전
- 내 체육관 / 전체 커뮤니티 분리
- 댓글 답글, 수정, 삭제
- 영상 업로드 (30초)
- 검색 기능
- 공지사항
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Q, Count
from .models import Post, Comment, Like, Story, Member
from .serializers import PostSerializer, CommentSerializer, LikeSerializer, StorySerializer
import logging

logger = logging.getLogger(__name__)


class PostViewSet(viewsets.ModelViewSet):
    """게시글 ViewSet - 고도화"""
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """게시글 조회 - 내 체육관 / 전체 분리"""
        queryset = Post.objects.select_related('author').prefetch_related('comments').all()
        
        # 체육관 필터
        gym_only = self.request.query_params.get('gym_only', 'false').lower() == 'true'
        gym_id = self.request.query_params.get('gym_id')
        member_id = self.request.query_params.get('member_id')
        
        if gym_only and gym_id:
            # 내 체육관만
            queryset = queryset.filter(gym_id=gym_id)
        elif gym_only and member_id:
            # 내가 속한 체육관만
            try:
                member = Member.objects.get(id=member_id)
                if member.gym:
                    queryset = queryset.filter(gym=member.gym)
            except Member.DoesNotExist:
                pass
        
        # 카테고리 필터
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        # 검색 (제목 + 내용)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        # 고정 게시글 우선, 최신순
        return queryset.order_by('-is_pinned', '-created_at')
    
    def create(self, request, *args, **kwargs):
        """게시글 생성"""
        try:
            logger.info(f"게시글 생성 요청: {request.data}")
            
            # 영상 길이 검증 (30초)
            video_duration = request.data.get('video_duration', 0)
            if video_duration and int(video_duration) > 30:
                return Response({
                    'error': '영상은 최대 30초까지 업로드 가능합니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
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
    
    def update(self, request, *args, **kwargs):
        """게시글 수정"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # 작성자 확인
            author_id = request.data.get('author_id') or request.data.get('author')
            if str(instance.author.id) != str(author_id):
                return Response({
                    'error': '본인의 게시글만 수정할 수 있습니다.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"게시글 수정 실패: {str(e)}")
            return Response({
                'error': '게시글 수정 실패',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """게시글 삭제"""
        try:
            instance = self.get_object()
            
            # 작성자 확인
            author_id = request.data.get('author_id') or request.query_params.get('author_id')
            if author_id and str(instance.author.id) != str(author_id):
                return Response({
                    'error': '본인의 게시글만 삭제할 수 있습니다.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            self.perform_destroy(instance)
            return Response({'message': '게시글이 삭제되었습니다.'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"게시글 삭제 실패: {str(e)}")
            return Response({
                'error': '게시글 삭제 실패',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """게시물 좋아요/취소 토글"""
        try:
            post = self.get_object()
            member_id = request.data.get('member') or request.data.get('member_id') or request.data.get('author')
            
            if not member_id:
                return Response({'error': '회원 ID가 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
            
            like, created = Like.objects.get_or_create(
                post=post,
                member_id=member_id
            )
            
            if not created:
                # 이미 좋아요 했으면 취소
                like.delete()
                post.like_count = max(0, post.like_count - 1)
                post.save()
                return Response({
                    'message': '좋아요 취소',
                    'liked': False,
                    'like_count': post.like_count
                }, status=status.HTTP_200_OK)
            else:
                # 새로 좋아요
                post.like_count += 1
                post.save()
                return Response({
                    'message': '좋아요!',
                    'liked': True,
                    'like_count': post.like_count
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"좋아요 처리 실패: {str(e)}")
            return Response({
                'error': '좋아요 처리 중 오류가 발생했습니다.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        """게시물 좋아요 취소"""
        try:
            post = self.get_object()
            member_id = request.data.get('member') or request.data.get('member_id') or request.data.get('author')
            
            if not member_id:
                return Response({'error': '회원 ID가 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
            
            like = Like.objects.filter(post=post, member_id=member_id).first()
            if like:
                like.delete()
                post.like_count = max(0, post.like_count - 1)
                post.save()
                return Response({
                    'message': '좋아요 취소',
                    'liked': False,
                    'like_count': post.like_count
                })
            else:
                return Response({
                    'message': '좋아요하지 않은 게시글입니다.',
                    'liked': False,
                    'like_count': post.like_count
                })
        except Exception as e:
            logger.error(f"좋아요 취소 실패: {str(e)}")
            return Response({
                'error': '좋아요 취소 중 오류가 발생했습니다.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """게시물 조회수 증가"""
        post = self.get_object()
        post.view_count += 1
        post.save()
        return Response({'view_count': post.view_count})
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """게시글의 댓글 목록 조회"""
        post = self.get_object()
        comments = Comment.objects.filter(post=post, parent=None).select_related('author').order_by('created_at')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """댓글 작성"""
        try:
            post = self.get_object()
            author_id = request.data.get('author') or request.data.get('author_id') or request.data.get('member')
            content = request.data.get('content')
            parent_id = request.data.get('parent')  # 답글인 경우
            
            if not author_id or not content:
                return Response({
                    'error': '작성자 ID와 내용이 필요합니다'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            comment_data = {
                'post': post.id,
                'author': author_id,
                'content': content
            }
            
            if parent_id:
                comment_data['parent'] = parent_id
            
            comment = Comment.objects.create(
                post=post,
                author_id=author_id,
                content=content,
                parent_id=parent_id if parent_id else None
            )
            
            # 댓글 수 증가 (답글은 제외)
            if not parent_id:
                post.comment_count += 1
                post.save()
            
            serializer = CommentSerializer(comment, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"댓글 작성 실패: {str(e)}")
            return Response({
                'error': '댓글 작성 실패',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def announcements(self, request):
        """공지사항 조회"""
        gym_id = request.query_params.get('gym_id')
        
        queryset = Post.objects.filter(
            is_pinned=True,
            category='notice'
        ).select_related('author')
        
        if gym_id:
            queryset = queryset.filter(gym_id=gym_id)
        
        queryset = queryset.order_by('-created_at')[:5]  # 최근 5개
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """댓글 ViewSet - 고도화 (답글, 수정, 삭제)"""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """댓글 조회"""
        queryset = Comment.objects.select_related('author', 'post').prefetch_related('replies').all()
        
        post_id = self.request.query_params.get('post')
        if post_id:
            queryset = queryset.filter(post_id=post_id, parent=None)  # 최상위 댓글만
        
        return queryset.order_by('created_at')
    
    def update(self, request, *args, **kwargs):
        """댓글 수정"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # 작성자 확인
            author_id = request.data.get('author_id') or request.data.get('author')
            if author_id and str(instance.author.id) != str(author_id):
                return Response({
                    'error': '본인의 댓글만 수정할 수 있습니다.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"댓글 수정 실패: {str(e)}")
            return Response({
                'error': '댓글 수정 실패',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """댓글 삭제"""
        try:
            instance = self.get_object()
            
            # 작성자 확인
            author_id = request.data.get('author_id') or request.query_params.get('author_id')
            if author_id and str(instance.author.id) != str(author_id):
                return Response({
                    'error': '본인의 댓글만 삭제할 수 있습니다.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # 댓글 수 감소 (최상위 댓글만)
            if not instance.parent:
                post = instance.post
                post.comment_count = max(0, post.comment_count - 1)
                post.save()
            
            self.perform_destroy(instance)
            return Response({'message': '댓글이 삭제되었습니다.'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"댓글 삭제 실패: {str(e)}")
            return Response({
                'error': '댓글 삭제 실패',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """댓글의 답글 조회"""
        comment = self.get_object()
        replies = Comment.objects.filter(parent=comment).select_related('author').order_by('created_at')
        serializer = self.get_serializer(replies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """댓글 좋아요/취소"""
        try:
            comment = self.get_object()
            member_id = request.data.get('member') or request.data.get('member_id')
            
            if not member_id:
                return Response({'error': '회원 ID가 필요합니다'}, status=status.HTTP_400_BAD_REQUEST)
            
            like, created = Like.objects.get_or_create(
                comment=comment,
                member_id=member_id
            )
            
            if not created:
                like.delete()
                comment.like_count = max(0, comment.like_count - 1)
                comment.save()
                return Response({
                    'message': '좋아요 취소',
                    'liked': False,
                    'like_count': comment.like_count
                })
            else:
                comment.like_count += 1
                comment.save()
                return Response({
                    'message': '좋아요!',
                    'liked': True,
                    'like_count': comment.like_count
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"댓글 좋아요 실패: {str(e)}")
            return Response({
                'error': '좋아요 처리 중 오류가 발생했습니다.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StoryViewSet(viewsets.ModelViewSet):
    """스토리 ViewSet"""
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # 만료되지 않은 스토리만 반환
        now = timezone.now()
        queryset = Story.objects.filter(expires_at__gt=now).select_related('author')
        member_id = self.request.query_params.get('member')
        if member_id:
            queryset = queryset.filter(author_id=member_id)
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """스토리 조회수 증가"""
        story = self.get_object()
        story.view_count += 1
        story.save()
        return Response({'view_count': story.view_count})
    
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
        queryset = Like.objects.select_related('member', 'post', 'comment').all()
        post_id = self.request.query_params.get('post')
        member_id = self.request.query_params.get('member')
        
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        
        return queryset.order_by('-created_at')

