import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from members.models import MembershipPlan, Member

# 한국 성씨와 이름
LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍']
FIRST_NAMES_M = ['민준', '서준', '예준', '도윤', '시우', '주원', '하준', '지호', '준서', '건우', '우진', '현우', '선우', '연우', '유준', '정우', '승우', '민재', '지훈', '승현']
FIRST_NAMES_F = ['서연', '서윤', '지우', '서현', '민서', '하은', '하윤', '윤서', '지유', '지민', '채원', '수아', '다은', '예은', '소율', '지안', '지원', '수빈', '예린', '예원']

PHONE_PREFIXES = ['010']

ADDRESSES = [
    '서울시 강남구 역삼동',
    '서울시 송파구 잠실동',
    '서울시 서초구 서초동',
    '서울시 마포구 합정동',
    '서울시 영등포구 여의도동',
    '서울시 용산구 이태원동',
    '서울시 종로구 종로',
    '서울시 중구 명동',
    '경기도 성남시 분당구',
    '경기도 고양시 일산동구',
    '인천시 연수구 송도동',
]

LEVELS = ['흰띠', '노란띠', '주황띠', '초록띠', '파란띠', '보라띠', '빨간띠', '검은띠 1단', '검은띠 2단', '검은띠 3단']

def random_phone():
    return f"{random.choice(PHONE_PREFIXES)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"

def random_date(start_year=2020, end_year=2025):
    start_date = datetime(start_year, 1, 1)
    end_date = datetime(end_year, 12, 31)
    random_days = random.randint(0, (end_date - start_date).days)
    return start_date + timedelta(days=random_days)

def create_membership_plans():
    """10개의 다양한 상품 생성"""
    plans = [
        {
            'name': '주짓수 무제한 - 1개월',
            'category': 'bjj',
            'price': Decimal('150000'),
            'original_price': Decimal('180000'),
            'duration_months': 1,
            'duration_days': 30,
            'weekly_limit': 0,
            'discount_rate': Decimal('16.67'),
            'continuous_discount': Decimal('5.00'),
            'family_discount': Decimal('10.00'),
            'includes_uniform': True,
            'includes_locker': True,
            'is_popular': True,
        },
        {
            'name': '주짓수 무제한 - 3개월',
            'category': 'bjj',
            'price': Decimal('400000'),
            'original_price': Decimal('540000'),
            'duration_months': 3,
            'duration_days': 90,
            'weekly_limit': 0,
            'discount_rate': Decimal('25.93'),
            'continuous_discount': Decimal('10.00'),
            'family_discount': Decimal('15.00'),
            'includes_uniform': True,
            'includes_rashguard': True,
            'includes_locker': True,
            'is_popular': True,
        },
        {
            'name': '주짓수 무제한 - 6개월',
            'category': 'bjj',
            'price': Decimal('720000'),
            'original_price': Decimal('1080000'),
            'duration_months': 6,
            'duration_days': 180,
            'weekly_limit': 0,
            'discount_rate': Decimal('33.33'),
            'continuous_discount': Decimal('15.00'),
            'family_discount': Decimal('20.00'),
            'includes_uniform': True,
            'includes_rashguard': True,
            'includes_locker': True,
            'includes_towel': True,
            'is_popular': False,
        },
        {
            'name': '주짓수 주 3회 - 1개월',
            'category': 'bjj',
            'price': Decimal('110000'),
            'original_price': Decimal('130000'),
            'duration_months': 1,
            'duration_days': 30,
            'weekly_limit': 3,
            'discount_rate': Decimal('15.38'),
            'continuous_discount': Decimal('5.00'),
            'family_discount': Decimal('10.00'),
            'includes_locker': True,
            'is_popular': False,
        },
        {
            'name': 'MMA 무제한 - 1개월',
            'category': 'mma',
            'price': Decimal('160000'),
            'original_price': Decimal('200000'),
            'duration_months': 1,
            'duration_days': 30,
            'weekly_limit': 0,
            'discount_rate': Decimal('20.00'),
            'continuous_discount': Decimal('5.00'),
            'family_discount': Decimal('10.00'),
            'includes_uniform': True,
            'includes_gear': True,
            'includes_locker': True,
            'is_popular': True,
        },
        {
            'name': 'MMA 무제한 - 3개월',
            'category': 'mma',
            'price': Decimal('420000'),
            'original_price': Decimal('600000'),
            'duration_months': 3,
            'duration_days': 90,
            'weekly_limit': 0,
            'discount_rate': Decimal('30.00'),
            'continuous_discount': Decimal('10.00'),
            'family_discount': Decimal('15.00'),
            'includes_uniform': True,
            'includes_gear': True,
            'includes_locker': True,
            'includes_towel': True,
            'is_popular': False,
        },
        {
            'name': '복싱 무제한 - 1개월',
            'category': 'boxing',
            'price': Decimal('140000'),
            'original_price': Decimal('170000'),
            'duration_months': 1,
            'duration_days': 30,
            'weekly_limit': 0,
            'discount_rate': Decimal('17.65'),
            'continuous_discount': Decimal('5.00'),
            'family_discount': Decimal('10.00'),
            'includes_gear': True,
            'includes_locker': True,
            'is_popular': False,
        },
        {
            'name': '복싱 주 2회 - 1개월',
            'category': 'boxing',
            'price': Decimal('90000'),
            'original_price': Decimal('110000'),
            'duration_months': 1,
            'duration_days': 30,
            'weekly_limit': 2,
            'discount_rate': Decimal('18.18'),
            'continuous_discount': Decimal('5.00'),
            'family_discount': Decimal('10.00'),
            'includes_locker': True,
            'is_popular': False,
        },
        {
            'name': '키즈 주짓수 - 1개월',
            'category': 'kids',
            'price': Decimal('100000'),
            'original_price': Decimal('120000'),
            'duration_months': 1,
            'duration_days': 30,
            'weekly_limit': 3,
            'discount_rate': Decimal('16.67'),
            'continuous_discount': Decimal('5.00'),
            'family_discount': Decimal('20.00'),
            'includes_uniform': True,
            'is_popular': True,
        },
        {
            'name': 'PT 10회권',
            'category': 'pt',
            'price': Decimal('500000'),
            'original_price': Decimal('600000'),
            'duration_months': 3,
            'duration_days': 90,
            'visits': 10,
            'discount_rate': Decimal('16.67'),
            'continuous_discount': Decimal('0'),
            'family_discount': Decimal('0'),
            'is_popular': False,
        },
    ]
    
    print("Creating membership plans...")
    for plan_data in plans:
        plan, created = MembershipPlan.objects.get_or_create(
            name=plan_data['name'],
            defaults=plan_data
        )
        if created:
            print(f"+ Created: {plan.name}")
        else:
            print(f"- Already exists: {plan.name}")
    
    print(f"\nTotal plans: {MembershipPlan.objects.count()}")

def create_members():
    """140명의 가상 회원 생성"""
    print("\nCreating members...")
    
    plans = list(MembershipPlan.objects.all())
    if not plans:
        print("No membership plans found! Create plans first.")
        return
    
    created_count = 0
    
    for i in range(140):
        # 성별 랜덤
        gender = random.choice(['M', 'F'])
        
        # 이름 생성
        last_name = random.choice(LAST_NAMES)
        if gender == 'M':
            first_name = random.choice(FIRST_NAMES_M)
        else:
            first_name = random.choice(FIRST_NAMES_F)
        
        # 생년월일 (20-60세)
        birth_year = random.randint(1965, 2005)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)
        dob = datetime(birth_year, birth_month, birth_day).date()
        
        # 연락처
        phone = random_phone()
        email = f"{last_name.lower()}{first_name.lower()}{random.randint(100, 999)}@email.com"
        
        # 주소
        address = random.choice(ADDRESSES)
        
        # 등록일 (2020-2025년 사이)
        joined_date = random_date(2020, 2025).date()
        
        # 현재 플랜 (70% 확률로 보유)
        current_plan = random.choice(plans) if random.random() < 0.7 else None
        
        # 만료일 (플랜이 있으면 등록일 + 플랜 기간)
        expire_date = None
        if current_plan:
            expire_date = joined_date + timedelta(days=current_plan.duration_days)
            # 30% 확률로 만료됨
            if random.random() < 0.3:
                expire_date = joined_date + timedelta(days=random.randint(-60, -1))
        
        # 출석일 (0-100일)
        total_attendance_days = random.randint(0, 100)
        
        # 마지막 방문
        last_visit_date = None
        last_visit_time = None
        if total_attendance_days > 0:
            last_visit_date = random_date(2024, 2025).date()
            hour = random.randint(6, 22)
            minute = random.choice([0, 15, 30, 45])
            from datetime import time as dt_time
            last_visit_time = dt_time(hour, minute)
        
        # 레벨 (무작위)
        current_level = random.choice(LEVELS)
        
        # 포인트 (0-10000)
        points = random.randint(0, 10000)
        
        # 응급연락처
        emergency_contact_name = f"{random.choice(LAST_NAMES)}{random.choice(FIRST_NAMES_M + FIRST_NAMES_F)}"
        emergency_contact_phone = random_phone()
        emergency_contact_relation = random.choice(['부모', '배우자', '형제', '자매', '친구'])
        
        # 건강 문제 (20% 확률)
        health_issues = ""
        if random.random() < 0.2:
            health_issues = random.choice([
                '허리 통증',
                '무릎 부상 경력',
                '어깨 수술 경력',
                '고혈압',
                '천식',
                '당뇨',
            ])
        
        # 메모 (30% 확률)
        notes = ""
        if random.random() < 0.3:
            notes = random.choice([
                '열심히 운동하는 회원',
                '초보자, 기초부터 지도 필요',
                '경쟁 대회 준비 중',
                'VIP 회원',
                '소개로 등록',
                '시범 회원',
            ])
        
        # 약관 동의 (모두 동의)
        terms_agreed_value = True
        privacy_agreed = True
        marketing_agreed_value = random.choice([True, False])
        
        # 결제일
        payment_day = random.randint(1, 28)
        
        # 다음 청구일
        next_billing = None
        if current_plan and expire_date and expire_date > datetime.now().date():
            next_billing = expire_date
        
        # 할인 가능 여부
        discount_allowed = random.choice([True, False])
        
        # 상태
        if current_plan and expire_date and expire_date > datetime.now().date():
            status = '활성'
        elif current_plan and expire_date and expire_date <= datetime.now().date():
            status = '만료'
        else:
            status = '대기'
        
        # 성별 변환 ('M' -> '남', 'F' -> '여')
        gender_kr = '남' if gender == 'M' else '여'
        
        # 회원 생성
        try:
            member, created = Member.objects.get_or_create(
                phone=phone,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'birth_date': dob,
                    'gender': gender_kr,
                    'address': address,
                    'current_plan': current_plan,
                    'expire_date': expire_date,
                    'total_attendance_days': total_attendance_days,
                    'last_visit_date': last_visit_date,
                    'last_visit_time': last_visit_time,
                    'current_level': current_level,
                    'points': points,
                    'notes': notes,
                    'terms_agreed': terms_agreed_value,
                    'privacy_agreed': privacy_agreed,
                    'marketing_agreed': marketing_agreed_value,
                    'payment_day': payment_day,
                    'next_billing': next_billing,
                    'discount_allowed': discount_allowed,
                    'status': status,
                    'is_approved': True if status == '활성' else False,
                }
            )
            
            if created:
                created_count += 1
                if created_count % 10 == 0:
                    print(f"Created {created_count} members...")
        
        except Exception as e:
            print(f"Error creating member: {e}")
            continue
    
    print(f"\n+ Total members created: {created_count}")
    print(f"Total members in database: {Member.objects.count()}")

if __name__ == '__main__':
    print("=" * 50)
    print("COCO Gym - Sample Data Generator")
    print("=" * 50)
    
    # 상품 생성
    create_membership_plans()
    
    # 회원 생성
    create_members()
    
    print("\n" + "=" * 50)
    print("Sample data creation completed!")
    print("=" * 50)

