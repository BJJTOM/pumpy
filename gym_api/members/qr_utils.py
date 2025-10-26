"""
QR 코드 체크인을 위한 유틸리티
"""
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from typing import Dict, Optional

# QR 토큰 비밀키 (settings.py에서 가져오거나 기본값 사용)
QR_SECRET_KEY = getattr(settings, 'QR_SECRET_KEY', settings.SECRET_KEY)
QR_TOKEN_EXPIRY = 60  # 60초


def generate_qr_token(member_id: int) -> str:
    """
    회원을 위한 QR 토큰 생성 (60초 유효)
    """
    payload = {
        'member_id': member_id,
        'type': 'qr_checkin',
        'exp': datetime.utcnow() + timedelta(seconds=QR_TOKEN_EXPIRY),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, QR_SECRET_KEY, algorithm='HS256')
    return token


def verify_qr_token(token: str) -> Optional[Dict]:
    """
    QR 토큰 검증 및 회원 ID 추출
    
    Returns:
        dict: {'member_id': int} or None if invalid
    """
    try:
        payload = jwt.decode(token, QR_SECRET_KEY, algorithms=['HS256'])
        
        if payload.get('type') != 'qr_checkin':
            return None
            
        return {
            'member_id': payload['member_id']
        }
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def can_checkin(member_id: int, last_checkin_time: Optional[datetime]) -> tuple[bool, str]:
    """
    체크인 가능 여부 확인 (2분 이내 중복 방지)
    
    Returns:
        tuple: (가능여부, 메시지)
    """
    if last_checkin_time is None:
        return True, "체크인 가능"
    
    time_diff = datetime.now() - last_checkin_time
    if time_diff.total_seconds() < 120:  # 2분
        remaining = 120 - int(time_diff.total_seconds())
        return False, f"{remaining}초 후 다시 체크인할 수 있습니다"
    
    return True, "체크인 가능"










