from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from datetime import date, timedelta, datetime
from .models import (Member, MembershipPlan, Subscription, Coupon, Revenue, 
                     Attendance, Locker, Coach, WOD, MemberNote, LevelHistory,
                     UserProfile, WorkoutLog, MealLog, Post, Comment, Like,
                     Story, ChatRoom, ChatMessage, Notification)
from .serializers import (MemberSerializer, MemberListSerializer, MembershipPlanSerializer, 
                          SubscriptionSerializer, CouponSerializer, RevenueSerializer, 
                          AttendanceSerializer, LockerSerializer, CoachSerializer, 
                          WODSerializer, MemberNoteSerializer, LevelHistorySerializer,
                          UserProfileSerializer, WorkoutLogSerializer, MealLogSerializer,
                          PostSerializer, CommentSerializer, LikeSerializer, StorySerializer,
                          ChatRoomSerializer, ChatMessageSerializer, NotificationSerializer)


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().order_by("-id")
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MemberListSerializer
        return MemberSerializer
    
    @action(detail=False, methods=['get'])
    def search_by_phone(self, request):
        """휴대폰 번호 뒤 4자리로 회원 검색 (출석용) - 동일 번호 모두 반환"""
        last4 = request.query_params.get('last4', '')
        
        if len(last4) != 4:
            return Response({
                'error': '휴대폰 번호 뒤 4자리를 입력해주세요'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 휴대폰 번호 뒤 4자리로 검색 (모든 회원)
        members = Member.objects.filter(phone__endswith=last4).order_by('-status', '-join_date')
        
        if not members.exists():
            return Response({
                'error': '회원 정보를 찾을 수 없습니다'
            }, status=status.HTTP_404_NOT_FOUND)
        
        today = date.today()
        result = []
        
        # 모든 조회된 회원의 정보를 반환
        for member in members:
            # 회원권 정보 조회
            subscriptions = Subscription.objects.filter(
                member=member
            ).select_related('plan').order_by('-start_date')
            
            memberships = []
            for sub in subscriptions:
                remaining_days = 0
                if sub.end_date:
                    remaining_days = (sub.end_date - today).days
                
                memberships.append({
                    'id': sub.id,
                    'plan_name': sub.plan.name if sub.plan else '회원권',
                    'start_date': sub.start_date.isoformat(),
                    'end_date': sub.end_date.isoformat() if sub.end_date else None,
                    'status': sub.status,
                    'remaining_days': remaining_days
                })
            
            # 출석 정보
            total_attendance = Attendance.objects.filter(
                member=member,
                status='출석'
            ).count()
            
            # 연속 출석 계산
            attendance_streak = 0
            current_date = today
            while True:
                if Attendance.objects.filter(member=member, date=current_date, status='출석').exists():
                    attendance_streak += 1
                    current_date -= timedelta(days=1)
                else:
                    break
            
            # 마지막 출석일
            last_attendance = Attendance.objects.filter(
                member=member,
                status='출석'
            ).order_by('-date').first()
            
            result.append({
                'id': member.id,
                'name': f"{member.last_name}{member.first_name}",
                'phone': member.phone,
                'status': member.status,
                'current_plan': member.current_plan.name if member.current_plan else None,
                'membership_end_date': member.expire_date.isoformat() if member.expire_date else None,
                'memberships': memberships,
                'total_attendance': total_attendance,
                'attendance_streak': attendance_streak,
                'last_attendance': last_attendance.date.isoformat() if last_attendance else None
            })
        
        # 회원이 1명이면 객체로, 여러 명이면 배열로 반환
        return Response(result if len(result) > 1 else result[0])
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        today = date.today()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # 전체 회원 통계 (한 번의 쿼리로 처리)
        members_aggregate = Member.objects.aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(status='active')),
            paused=Count('id', filter=Q(status='paused')),
            cancelled=Count('id', filter=Q(status='cancelled'))
        )
        
        total_members = members_aggregate['total']
        active_members = members_aggregate['active']
        paused_members = members_aggregate['paused']
        cancelled_members = members_aggregate['cancelled']
        
        # 만료 임박 회원 (한 번의 쿼리로 처리)
        expiry_aggregate = Member.objects.filter(
            status='active',
            expire_date__isnull=False
        ).aggregate(
            expire_7days=Count('id', filter=Q(
                expire_date__lte=today + timedelta(days=7),
                expire_date__gte=today
            )),
            expire_3days=Count('id', filter=Q(
                expire_date__lte=today + timedelta(days=3),
                expire_date__gte=today
            )),
            expire_today=Count('id', filter=Q(expire_date=today))
        )
        
        expire_7days = expiry_aggregate['expire_7days']
        expire_3days = expiry_aggregate['expire_3days']
        expire_today = expiry_aggregate['expire_today']
        
        # 이미 만료된 회원 (최대 10명만)
        expired_members = list(Member.objects.filter(
            status='active',
            expire_date__isnull=False,
            expire_date__lt=today
        ).only('id', 'first_name', 'last_name', 'phone', 'expire_date')[:10].values(
            'id', 'first_name', 'last_name', 'phone', 'expire_date'
        ))
        
        # 신규 회원
        month_start = today.replace(day=1)
        new_members_this_month = Member.objects.filter(
            join_date__gte=month_start
        ).count()
        
        # 장기 미출석 회원 (최대 10명만, 쿼리 최적화)
        recent_attendance_member_ids = set(Attendance.objects.filter(
            date__gte=month_ago,
            status='출석'
        ).values_list('member_id', flat=True).distinct())
        
        inactive_members = list(Member.objects.filter(
            status='active'
        ).exclude(
            id__in=list(recent_attendance_member_ids)[:100]  # 최대 100명만 체크
        ).only('id', 'first_name', 'last_name', 'phone', 'join_date')[:10].values(
            'id', 'first_name', 'last_name', 'phone', 'join_date'
        ))
        
        # 출석률
        week_attendance = Attendance.objects.filter(
            date__gte=week_ago,
            status='출석'
        ).values('member_id').distinct().count()
        
        attendance_rate = 0
        if active_members > 0:
            attendance_rate = round((week_attendance / active_members) * 100, 1)
        
        # 매출
        month_revenue = Revenue.objects.filter(
            date__gte=month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        last_month_start = (month_start - timedelta(days=1)).replace(day=1)
        last_month_revenue = Revenue.objects.filter(
            date__gte=last_month_start,
            date__lt=month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        revenue_growth = 0
        if last_month_revenue > 0:
            revenue_growth = round(((month_revenue - last_month_revenue) / last_month_revenue) * 100, 1)
        
        # 재등록률
        last_month_expired = Member.objects.filter(
            expire_date__gte=last_month_start,
            expire_date__lt=month_start
        ).count()
        
        renewed = Member.objects.filter(
            expire_date__gte=last_month_start,
            expire_date__lt=month_start
        ).filter(
            expire_date__gte=month_start
        ).count()
        
        renewal_rate = 0
        if last_month_expired > 0:
            renewal_rate = round((renewed / last_month_expired) * 100, 1)
        
        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'paused_members': paused_members,
            'cancelled_members': cancelled_members,
            'expire_7days': expire_7days,
            'expire_3days': expire_3days,
            'expire_today': expire_today,
            'expired_members': list(expired_members),
            'new_members_this_month': new_members_this_month,
            'inactive_members': list(inactive_members),
            'attendance_rate': attendance_rate,
            'month_revenue': float(month_revenue),
            'revenue_growth': revenue_growth,
            'renewal_rate': renewal_rate,
        })


class MembershipPlanViewSet(viewsets.ModelViewSet):
    queryset = MembershipPlan.objects.all().order_by("name")
    serializer_class = MembershipPlanSerializer


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.select_related("member", "plan").all().order_by("-start_date")
    serializer_class = SubscriptionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        member_id = self.request.query_params.get('member_id')
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset
    
    def perform_create(self, serializer):
        """회원권 구매 시 매출 자동 등록"""
        subscription = serializer.save()
        
        # 매출 자동 등록
        if subscription.plan:
            Revenue.objects.create(
                date=date.today(),
                amount=subscription.plan.price,
                net_amount=subscription.plan.price,
                method='카드',
                memo=f'{subscription.member.first_name} {subscription.member.last_name} - {subscription.plan.name}',
                member=subscription.member,
                plan=subscription.plan
            )


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by("-id")
    serializer_class = CouponSerializer


class RevenueViewSet(viewsets.ModelViewSet):
    queryset = Revenue.objects.all().order_by("-date", "-id")
    serializer_class = RevenueSerializer
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        today = date.today()
        month_start = today.replace(day=1)
        
        month_revenue = Revenue.objects.filter(date__gte=month_start).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        today_revenue = Revenue.objects.filter(date=today).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        daily_revenue = []
        for i in range(30):
            day = today - timedelta(days=29-i)
            amount = Revenue.objects.filter(date=day).aggregate(
                total=Sum('amount')
            )['total'] or 0
            daily_revenue.append({
                'date': day.isoformat(),
                'amount': float(amount)
            })
        
        return Response({
            'month_revenue': float(month_revenue),
            'today_revenue': float(today_revenue),
            'daily_revenue': daily_revenue
        })


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by("-date", "-time")
    serializer_class = AttendanceSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        member_id = self.request.query_params.get('member_id')
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset
    
    def create(self, request, *args, **kwargs):
        """출석 체크 (중복 체크 포함)"""
        member_id = request.data.get('member')
        check_date = request.data.get('date', date.today().isoformat())
        
        if not member_id:
            return Response({
                'error': '회원 ID가 필요합니다'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 오늘 이미 출석했는지 확인
        existing = Attendance.objects.filter(
            member_id=member_id,
            date=check_date,
            status='출석'
        ).exists()
        
        if existing:
            return Response({
                'error': '오늘 이미 출석하셨습니다'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 출석 등록
        from datetime import datetime
        attendance_data = {
            'member': member_id,
            'date': check_date,
            'time': datetime.now().time().isoformat(),
            'status': '출석'
        }
        
        serializer = self.get_serializer(data=attendance_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'message': '출석이 완료되었습니다',
            'attendance': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def weekly_stats(self, request):
        today = date.today()
        
        daily_counts = []
        for i in range(7):
            day = today - timedelta(days=6-i)
            count = Attendance.objects.filter(date=day, status='출석').count()
            daily_counts.append({
                'date': day.isoformat(),
                'count': count
            })
        
        return Response(daily_counts)
    
    @action(detail=False, methods=['get'])
    def hourly_stats(self, request):
        week_ago = date.today() - timedelta(days=7)
        
        hourly_data = {}
        attendances = Attendance.objects.filter(
            date__gte=week_ago,
            status='출석'
        ).values_list('time', flat=True)
        
        for time_obj in attendances:
            if time_obj:
                hour = time_obj.hour
                hourly_data[hour] = hourly_data.get(hour, 0) + 1
        
        result = [{'hour': h, 'count': hourly_data.get(h, 0)} for h in range(24)]
        
        return Response(result)


class LockerViewSet(viewsets.ModelViewSet):
    queryset = Locker.objects.all().order_by("no")
    serializer_class = LockerSerializer


class CoachViewSet(viewsets.ModelViewSet):
    queryset = Coach.objects.all().order_by("name")
    serializer_class = CoachSerializer


class WODViewSet(viewsets.ModelViewSet):
    queryset = WOD.objects.all().order_by("-date")
    serializer_class = WODSerializer


class MemberNoteViewSet(viewsets.ModelViewSet):
    queryset = MemberNote.objects.all().order_by("-date")
    serializer_class = MemberNoteSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        member_id = self.request.query_params.get('member_id')
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset


class LevelHistoryViewSet(viewsets.ModelViewSet):
    queryset = LevelHistory.objects.all().order_by("-date")
    serializer_class = LevelHistorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        member_id = self.request.query_params.get('member_id')
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset


# 공개 회원가입 API
@api_view(['POST'])
@permission_classes([AllowAny])
def public_signup(request):
    """
    앱에서 공개적으로 접근 가능한 회원가입 API
    승인 대기 상태로 회원을 등록합니다.
    """
    data = request.data.copy()
    
    # 기본값 설정
    data['status'] = '대기'
    data['is_approved'] = False
    data['terms_agreed_date'] = datetime.now().isoformat() if data.get('terms_agreed') else None
    data['privacy_agreed_date'] = datetime.now().isoformat() if data.get('privacy_agreed') else None
    data['marketing_agreed_date'] = datetime.now().isoformat() if data.get('marketing_agreed') else None
    
    # 필수 약관 확인
    if not data.get('terms_agreed') or not data.get('privacy_agreed'):
        return Response({
            'error': '이용약관과 개인정보처리방침에 동의해야 합니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = MemberSerializer(data=data)
    if serializer.is_valid():
        member = serializer.save()
        return Response({
            'message': '가입 신청이 완료되었습니다. 관리자 승인 후 이용하실 수 있습니다.',
            'member_id': member.id,
            'name': f"{member.last_name}{member.first_name}"
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def pending_members(request):
    """승인 대기 중인 회원 목록"""
    members = Member.objects.filter(status='pending', is_approved=False).order_by('-join_date')
    serializer = MemberListSerializer(members, many=True)
    return Response(serializer.data)


# 회원용 앱 ViewSets
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer


class WorkoutLogViewSet(viewsets.ModelViewSet):
    queryset = WorkoutLog.objects.all().order_by('-date')
    serializer_class = WorkoutLogSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        member_id = self.request.query_params.get('member_id', None)
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset


class MealLogViewSet(viewsets.ModelViewSet):
    queryset = MealLog.objects.all().order_by('-date')
    serializer_class = MealLogSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        member_id = self.request.query_params.get('member_id', None)
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        member_id = request.data.get('member_id')
        
        if not member_id:
            return Response({'error': 'member_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        like, created = Like.objects.get_or_create(
            member_id=member_id,
            post=post
        )
        
        if not created:
            like.delete()
            post.like_count -= 1
            post.save()
            return Response({'liked': False})
        else:
            post.like_count += 1
            post.save()
            return Response({'liked': True})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.request.query_params.get('post_id', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset
    
    def perform_create(self, serializer):
        comment = serializer.save()
        # 댓글 수 업데이트
        post = comment.post
        post.comment_count = Comment.objects.filter(post=post).count()
        post.save()


class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.filter(expires_at__gte=datetime.now()).order_by('-created_at')
    serializer_class = StorySerializer


class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all().order_by('-last_message_at')
    serializer_class = ChatRoomSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        member_id = self.request.query_params.get('member_id', None)
        if member_id:
            queryset = queryset.filter(members__id=member_id)
        return queryset


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all().order_by('created_at')
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        room_id = self.request.query_params.get('room_id', None)
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        return queryset
    
    def perform_create(self, serializer):
        message = serializer.save()
        # 채팅방의 마지막 메시지 업데이트
        room = message.room
        room.last_message = message.content
        room.last_message_at = message.created_at
        room.save()


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        recipient_id = self.request.query_params.get('recipient_id', None)
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)
        return queryset
