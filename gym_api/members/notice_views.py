from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from .models import Notice, Banner
from .notice_serializers import NoticeSerializer, BannerSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    """공지사항 API"""
    queryset = Notice.objects.filter(is_active=True)
    serializer_class = NoticeSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Notice.objects.filter(is_active=True)
        
        # 체육관 필터링
        gym_id = self.request.query_params.get('gym_id', None)
        if gym_id:
            queryset = queryset.filter(gym_id=gym_id)
        
        return queryset.order_by('-is_pinned', '-created_at')
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """활성화된 공지사항만 조회"""
        notices = self.get_queryset()
        serializer = self.get_serializer(notices, many=True)
        return Response(serializer.data)


class BannerViewSet(viewsets.ModelViewSet):
    """배너 API"""
    queryset = Banner.objects.filter(is_active=True)
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Banner.objects.filter(is_active=True)
        now = timezone.now()
        
        # 기간 필터링
        queryset = queryset.filter(
            start_date__lte=now,
            end_date__gte=now
        ) | queryset.filter(start_date__isnull=True, end_date__isnull=True)
        
        # 체육관 필터링
        gym_id = self.request.query_params.get('gym_id', None)
        if gym_id:
            queryset = queryset.filter(gym_id=gym_id)
        
        return queryset.order_by('order', '-created_at')
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """활성화된 배너만 조회"""
        banners = self.get_queryset()
        serializer = self.get_serializer(banners, many=True)
        return Response(serializer.data)

