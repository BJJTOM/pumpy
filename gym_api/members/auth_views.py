from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from datetime import datetime
import random
import string
from .models import Member
from .serializers import MemberSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """회원가입 API"""
    data = request.data
    
    # 필수 필드 확인
    required_fields = ['email', 'password', 'first_name', 'last_name', 'phone']
    for field in required_fields:
        if not data.get(field):
            return Response({
                'error': f'{field} 필드는 필수입니다.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # 이메일 중복 확인
    if Member.objects.filter(email=data['email']).exists():
        return Response({
            'error': '이미 사용 중인 이메일입니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 전화번호 중복 확인
    if Member.objects.filter(phone=data['phone']).exists():
        return Response({
            'error': '이미 사용 중인 전화번호입니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 비밀번호 확인
    if data.get('password') != data.get('password_confirm'):
        return Response({
            'error': '비밀번호가 일치하지 않습니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 약관 동의 확인
    if not data.get('terms_agreed'):
        return Response({
            'error': '이용약관에 동의해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not data.get('privacy_agreed'):
        return Response({
            'error': '개인정보처리방침에 동의해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 회원 생성
        member = Member.objects.create(
            email=data['email'],
            password=make_password(data['password']),  # 비밀번호 해싱
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data['phone'],
            phone_verified=data.get('phone_verified', False),
            terms_agreed=data.get('terms_agreed', False),
            terms_agreed_date=datetime.now() if data.get('terms_agreed') else None,
            privacy_agreed=data.get('privacy_agreed', False),
            privacy_agreed_date=datetime.now() if data.get('privacy_agreed') else None,
            marketing_agreed=data.get('marketing_agreed', False),
            marketing_agreed_date=datetime.now() if data.get('marketing_agreed') else None,
            status='active',  # 회원가입 시 바로 활성화
            is_approved=True
        )
        
        serializer = MemberSerializer(member)
        
        # 간단한 토큰 생성 (실제로는 JWT 사용 권장)
        token = f"token_{member.id}_{datetime.now().timestamp()}"
        
        return Response({
            'message': '회원가입이 완료되었습니다.',
            'user': serializer.data,
            'token': token
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'회원가입 중 오류가 발생했습니다: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """로그인 API"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': '이메일과 비밀번호를 입력해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 이메일로 회원 찾기
        member = Member.objects.get(email=email)
        
        # 비밀번호 확인
        if not check_password(password, member.password):
            return Response({
                'error': '이메일 또는 비밀번호가 올바르지 않습니다.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # 계정 상태 확인
        if member.status == 'cancelled':
            return Response({
                'error': '해지된 계정입니다. 관리자에게 문의하세요.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MemberSerializer(member)
        
        # 간단한 토큰 생성 (실제로는 JWT 사용 권장)
        token = f"token_{member.id}_{datetime.now().timestamp()}"
        
        return Response({
            'message': '로그인 성공',
            'user': serializer.data,
            'token': token
        }, status=status.HTTP_200_OK)
        
    except Member.DoesNotExist:
        return Response({
            'error': '이메일 또는 비밀번호가 올바르지 않습니다.'
        }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({
            'error': f'로그인 중 오류가 발생했습니다: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code(request):
    """전화번호 인증 코드 전송 (실제로는 SMS 발송)"""
    phone = request.data.get('phone')
    
    if not phone:
        return Response({
            'error': '전화번호를 입력해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 6자리 인증 코드 생성
    code = ''.join(random.choices(string.digits, k=6))
    
    # 실제 서비스에서는 SMS 발송 API 호출
    # 여기서는 시뮬레이션
    # TODO: SMS 발송 API 연동 (예: 알리고, 네이버 클라우드, AWS SNS)
    
    return Response({
        'message': '인증 코드가 전송되었습니다.',
        'code': code,  # 개발 중에만 반환 (실제 서비스에서는 제거)
        'expires_in': 180  # 3분
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_phone(request):
    """전화번호 인증 확인"""
    phone = request.data.get('phone')
    code = request.data.get('code')
    
    if not phone or not code:
        return Response({
            'error': '전화번호와 인증 코드를 입력해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 실제 서비스에서는 인증 코드 검증
    # 여기서는 시뮬레이션 (모든 코드 허용)
    # TODO: 실제 인증 코드 검증 로직 구현
    
    return Response({
        'message': '전화번호 인증이 완료되었습니다.',
        'verified': True
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_request(request):
    """비밀번호 재설정 요청 (이메일로 인증 코드 전송)"""
    email = request.data.get('email')
    
    if not email:
        return Response({
            'error': '이메일을 입력해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        member = Member.objects.get(email=email)
        
        # 6자리 인증 코드 생성
        code = ''.join(random.choices(string.digits, k=6))
        
        # 실제 서비스에서는 이메일 발송
        # TODO: 이메일 발송 API 연동
        
        return Response({
            'message': '비밀번호 재설정 인증 코드가 이메일로 전송되었습니다.',
            'code': code,  # 개발 중에만 반환 (실제 서비스에서는 제거)
            'expires_in': 600  # 10분
        }, status=status.HTTP_200_OK)
        
    except Member.DoesNotExist:
        # 보안상 이메일 존재 여부를 알려주지 않음
        return Response({
            'message': '해당 이메일로 가입된 계정이 있다면 인증 코드가 전송되었습니다.'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    """비밀번호 재설정 확인"""
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    if not email or not code or not new_password:
        return Response({
            'error': '모든 필드를 입력해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        member = Member.objects.get(email=email)
        
        # 실제 서비스에서는 인증 코드 검증
        # TODO: 인증 코드 검증 로직
        
        # 비밀번호 업데이트
        member.password = make_password(new_password)
        member.save()
        
        return Response({
            'message': '비밀번호가 성공적으로 변경되었습니다.'
        }, status=status.HTTP_200_OK)
        
    except Member.DoesNotExist:
        return Response({
            'error': '유효하지 않은 요청입니다.'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def check_email(request):
    """이메일 중복 확인"""
    email = request.data.get('email')
    
    if not email:
        return Response({
            'error': '이메일을 입력해주세요.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = Member.objects.filter(email=email).exists()
    
    return Response({
        'exists': exists,
        'message': '사용 가능한 이메일입니다.' if not exists else '이미 사용 중인 이메일입니다.'
    }, status=status.HTTP_200_OK)

