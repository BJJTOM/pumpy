# 회원권 결제 처리 API
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import timedelta
from .models import Member, MembershipPlan, Subscription, Revenue
from .serializers import SubscriptionSerializer, MembershipPlanSerializer
import logging

logger = logging.getLogger(__name__)


class MembershipPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """회원권 상품 조회 (읽기 전용)"""
    queryset = MembershipPlan.objects.filter(is_active=True).order_by('display_order', 'category', 'name')
    serializer_class = MembershipPlanSerializer
    permission_classes = [AllowAny]


class PaymentViewSet(viewsets.ViewSet):
    """결제 처리 ViewSet"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def purchase_membership(self, request):
        """회원권 구매 (간단 결제)"""
        try:
            member_id = request.data.get('member_id')
            plan_id = request.data.get('plan_id')
            payment_method = request.data.get('payment_method', '카드')
            
            if not member_id or not plan_id:
                return Response({
                    'error': '회원 ID와 상품 ID가 필요합니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 회원 및 상품 조회
            try:
                member = Member.objects.get(id=member_id)
                plan = MembershipPlan.objects.get(id=plan_id, is_active=True)
            except Member.DoesNotExist:
                return Response({'error': '회원을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
            except MembershipPlan.DoesNotExist:
                return Response({'error': '상품을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
            
            # 시작일/종료일 계산
            start_date = timezone.now().date()
            if plan.duration_months:
                end_date = start_date + timedelta(days=plan.duration_months * 30)
            elif plan.duration_days:
                end_date = start_date + timedelta(days=plan.duration_days)
            else:
                end_date = start_date + timedelta(days=30)  # 기본 30일
            
            # 결제 금액 (할인 적용)
            amount_paid = plan.discount_price if hasattr(plan, 'discount_price') else plan.price
            
            # 구독 생성
            subscription = Subscription.objects.create(
                member=member,
                plan=plan,
                start_date=start_date,
                end_date=end_date,
                amount_paid=amount_paid,
                is_active=True,
                approval_status='approved',
                payment_method=payment_method,
                approved_at=timezone.now()
            )
            
            # 회원 정보 업데이트
            member.current_plan = plan.name
            member.expire_date = end_date
            member.status = 'active'
            member.save()
            
            # 매출 기록 생성
            Revenue.objects.create(
                member=member,
                amount=amount_paid,
                date=start_date,
                source=f'회원권 구매: {plan.name}',
                memo=f'결제수단: {payment_method}, 구독ID: {subscription.id}'
            )
            
            # 상품 통계 업데이트
            plan.total_sales += 1
            plan.active_users += 1
            plan.save()
            
            logger.info(f"회원권 구매 성공: 회원 ID={member_id}, 상품={plan.name}, 금액={amount_paid}")
            
            return Response({
                'success': True,
                'subscription_id': subscription.id,
                'member_id': member.id,
                'plan_name': plan.name,
                'start_date': start_date,
                'end_date': end_date,
                'amount_paid': str(amount_paid),
                'message': '결제가 완료되었습니다!'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"회원권 구매 실패: {str(e)}")
            return Response({
                'error': '결제 처리 중 오류가 발생했습니다.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

