from django.db import models


class MembershipPlan(models.Model):
    CATEGORY_CHOICES = [
        ('일반', '일반 회원권'),
        ('다이어트', '다이어트 프로그램'),
        ('실전반', '실전반'),
        ('하드트레이닝', '하드 트레이닝'),
        ('키즈', '키즈 클래스'),
        ('PT', '개인 레슨'),
        ('그룹', '그룹 수업'),
    ]
    
    PERIOD_TYPE_CHOICES = [
        ('일반', '일반 (횟수 제한 없음)'),
        ('횟수제', '횟수제'),
        ('주_2회', '주 2회 기준'),
        ('주_3회', '주 3회 기준'),
        ('주_4-6회', '주 4-6회 (매일)'),
    ]
    
    # 기본 정보
    name = models.CharField(max_length=100, verbose_name='상품명')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='일반', verbose_name='카테고리')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='가격')
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='정가')
    
    # 기간 및 횟수
    duration_days = models.PositiveIntegerField(null=True, blank=True, verbose_name='기간(일)')
    duration_months = models.PositiveIntegerField(null=True, blank=True, verbose_name='기간(개월)')
    visits = models.PositiveIntegerField(null=True, blank=True, verbose_name='총 횟수')
    period_type = models.CharField(max_length=20, choices=PERIOD_TYPE_CHOICES, default='일반', verbose_name='수련 주기')
    weekly_limit = models.PositiveIntegerField(null=True, blank=True, verbose_name='주간 제한 횟수')
    
    # 할인 정책
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='할인율(%)')
    continuous_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='연속 등록 할인율(%)')
    family_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='가족/형제 할인율(%)')
    
    # 포함 사항
    includes_uniform = models.BooleanField(default=False, verbose_name='도복 포함')
    includes_rashguard = models.BooleanField(default=False, verbose_name='레시가드 포함')
    includes_locker = models.BooleanField(default=False, verbose_name='락커 포함')
    includes_towel = models.BooleanField(default=False, verbose_name='수건 포함')
    includes_gear = models.BooleanField(default=False, verbose_name='용품 포함')
    
    # 수업 시간대
    class_times = models.TextField(blank=True, verbose_name='수업 시간대 (JSON 형식)')
    
    # 상태
    is_active = models.BooleanField(default=True, verbose_name='활성화')
    is_popular = models.BooleanField(default=False, verbose_name='인기 상품')
    display_order = models.PositiveIntegerField(default=0, verbose_name='표시 순서')
    
    # 기타
    description = models.TextField(blank=True, verbose_name='상세 설명')
    notes = models.TextField(blank=True, verbose_name='비고')
    
    # 통계
    total_sales = models.PositiveIntegerField(default=0, verbose_name='총 판매 수')
    active_users = models.PositiveIntegerField(default=0, verbose_name='현재 이용자 수')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')

    class Meta:
        verbose_name = '회원권'
        verbose_name_plural = '회원권들'
        ordering = ['display_order', '-is_popular', 'category', 'name']

    def __str__(self) -> str:
        return f"[{self.category}] {self.name}"
    
    @property
    def discount_price(self):
        """할인 적용 가격"""
        if self.discount_rate > 0:
            discount_amount = float(self.price) * float(self.discount_rate) / 100
            return float(self.price) - discount_amount
        return float(self.price)
    
    @property
    def savings_amount(self):
        """절약 금액"""
        if self.original_price and self.original_price > self.price:
            return float(self.original_price) - float(self.price)
        return 0


class Member(models.Model):
    STATUS_CHOICES = [
        ('pending', '승인대기'), 
        ('active', '활성'), 
        ('paused', '정지'), 
        ('cancelled', '해지')
    ]
    LEVEL_CHOICES = [
        ('1단', '1단'), ('2단', '2단'), ('3단', '3단'), ('4단', '4단'),
        ('5단', '5단'), ('6단', '6단'), ('7단', '7단'), ('8단', '8단'),
        ('9단', '9단'), ('10단', '10단'), ('초보', '초보'), ('중급', '중급'), ('고급', '고급')
    ]
    RELIGION_CHOICES = [
        ('무교', '무교'), ('기독교', '기독교'), ('천주교', '천주교'),
        ('불교', '불교'), ('기타', '기타')
    ]
    AGE_GROUP_CHOICES = [
        ('유치부', '유치부'), ('초등부', '초등부'), ('중등부', '중등부'),
        ('고등부', '고등부'), ('대학부', '대학부'), ('일반부', '일반부')
    ]
    BLOOD_TYPE_CHOICES = [
        ('A', 'A형'), ('B', 'B형'), ('O', 'O형'), ('AB', 'AB형'), ('RH-', 'RH-')
    ]
    
    # 기본 정보
    first_name = models.CharField(max_length=50, verbose_name='이름')
    last_name = models.CharField(max_length=50, verbose_name='성')
    phone = models.CharField(max_length=20, blank=True, verbose_name='전화번호')
    email = models.EmailField(unique=True, verbose_name='이메일')
    password = models.CharField(max_length=255, blank=True, verbose_name='비밀번호')
    phone_verified = models.BooleanField(default=False, verbose_name='전화번호 인증 여부')
    email_verified = models.BooleanField(default=False, verbose_name='이메일 인증 여부')
    address = models.CharField(max_length=200, blank=True, verbose_name='주소')
    birth_date = models.DateField(null=True, blank=True, verbose_name='생년월일')
    gender = models.CharField(max_length=10, blank=True, choices=[('남', '남'), ('여', '여'), ('기타', '기타')], verbose_name='성별')
    
    # 프로필 사진
    photo = models.TextField(blank=True, verbose_name='프로필 사진 URL')
    
    # 입관원서 추가 정보
    member_number = models.CharField(max_length=50, blank=True, verbose_name='관번')  # 관번
    home_phone = models.CharField(max_length=20, blank=True, verbose_name='자택전화')  # 자택전화
    work_phone = models.CharField(max_length=20, blank=True, verbose_name='직장전화')  # 직장전화
    religion = models.CharField(max_length=20, blank=True, choices=RELIGION_CHOICES, verbose_name='종교')  # 종교
    age_group = models.CharField(max_length=20, blank=True, choices=AGE_GROUP_CHOICES, verbose_name='학년분류')  # 학년분류
    school_name = models.CharField(max_length=100, blank=True, verbose_name='학교명')  # 학교명
    school_grade = models.CharField(max_length=20, blank=True, verbose_name='학년/반')  # 학년/반
    age = models.PositiveIntegerField(null=True, blank=True, verbose_name='나이(만)')  # 나이
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='신장(cm)')  # 신장
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='체중(kg)')  # 체중
    blood_type = models.CharField(max_length=10, blank=True, choices=BLOOD_TYPE_CHOICES, verbose_name='혈액형')  # 혈액형
    
    # 입관/퇴관 정보
    admission_date = models.DateField(null=True, blank=True, verbose_name='입관일자')  # 입관일자
    withdrawal_date = models.DateField(null=True, blank=True, verbose_name='퇴관일자')  # 퇴관일자
    
    # 단(품) 정보
    dan_rank = models.CharField(max_length=50, blank=True, verbose_name='단(품)급')  # 단(품)급
    dan_rank_date = models.DateField(null=True, blank=True, verbose_name='단(품)급 취득일')  # 단(품)급 일자
    dan_rank_number = models.CharField(max_length=50, blank=True, verbose_name='단(품)번호')  # 단(품)번호
    
    # 부모/보호자 정보
    parent_job = models.CharField(max_length=100, blank=True, verbose_name='부모님 직업')  # 부모님 직업
    
    # 입관 관련 상세 정보
    admission_motivation = models.TextField(blank=True, verbose_name='입관 동기')  # 입관 동기
    personality_description = models.TextField(blank=True, verbose_name='본인 성격')  # 본인 성격  
    exercise_aptitude = models.TextField(blank=True, verbose_name='본인 운동 소질')  # 본인 운동 소질
    training_reason = models.TextField(blank=True, verbose_name='수련 보낸 이유')  # 태권도/수련 보낸 이유
    special_notes = models.TextField(blank=True, verbose_name='본인의 특기 사항')  # 본인의 특기 사항
    
    # 상태 및 회원권
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending', verbose_name='상태')
    is_approved = models.BooleanField(default=False, verbose_name='승인 여부')
    join_date = models.DateField(auto_now_add=True, verbose_name='가입일')
    current_plan = models.ForeignKey(MembershipPlan, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='현재 회원권')
    expire_date = models.DateField(null=True, blank=True, verbose_name='만료일')
    remaining_visits = models.PositiveIntegerField(null=True, blank=True, verbose_name='잔여 횟수')
    
    # 출석 관련
    total_attendance_days = models.PositiveIntegerField(default=0, verbose_name='총 출석일수')
    last_visit_date = models.DateField(null=True, blank=True, verbose_name='최근 방문일')
    last_visit_time = models.TimeField(null=True, blank=True, verbose_name='최근 방문시간')
    
    # 레벨/단수
    current_level = models.CharField(max_length=20, blank=True, choices=LEVEL_CHOICES, verbose_name='현재 단수')
    level_date = models.DateField(null=True, blank=True, verbose_name='단수 취득일')
    
    # 포인트
    points = models.IntegerField(default=0, verbose_name='포인트')
    
    # 결제 정보
    payment_day = models.PositiveIntegerField(null=True, blank=True, verbose_name='정기 결제일')
    next_billing = models.DateField(null=True, blank=True, verbose_name='다음 결제 예정일')
    discount_allowed = models.BooleanField(default=True, verbose_name='할인 적용 가능')
    
    # 약관 동의
    terms_agreed = models.BooleanField(default=False, verbose_name='이용약관 동의')
    terms_agreed_date = models.DateTimeField(null=True, blank=True, verbose_name='이용약관 동의일')
    privacy_agreed = models.BooleanField(default=False, verbose_name='개인정보처리방침 동의')
    privacy_agreed_date = models.DateTimeField(null=True, blank=True, verbose_name='개인정보 동의일')
    marketing_agreed = models.BooleanField(default=False, verbose_name='마케팅 수신 동의')
    marketing_agreed_date = models.DateTimeField(null=True, blank=True, verbose_name='마케팅 동의일')
    
    # 계약서
    contract_text = models.TextField(blank=True, verbose_name='계약서 내용')
    contract_date = models.DateField(null=True, blank=True, verbose_name='계약일')
    contract_file_url = models.TextField(blank=True, verbose_name='계약서 파일 URL')
    
    # 특이사항 및 메모
    notes = models.TextField(blank=True, verbose_name='특이사항/메모')
    medical_notes = models.TextField(blank=True, verbose_name='건강 특이사항')
    emergency_contact = models.CharField(max_length=100, blank=True, verbose_name='긴급 연락처')
    emergency_contact_relation = models.CharField(max_length=50, blank=True, verbose_name='긴급 연락처 관계')
    
    # 추천인
    referrer = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='추천인')
    
    # 락커
    locker_number = models.CharField(max_length=20, blank=True, verbose_name='락커 번호')
    locker_expire_date = models.DateField(null=True, blank=True, verbose_name='락커 만료일')
    
    class Meta:
        verbose_name = '회원'
        verbose_name_plural = '회원들'
        ordering = ['-join_date']

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.last_name}{self.first_name}"
    
    @property
    def days_until_expire(self):
        if self.expire_date:
            from datetime import date
            delta = self.expire_date - date.today()
            return delta.days
        return None


class Subscription(models.Model):
    APPROVAL_STATUS_CHOICES = [
        ('pending', '승인대기'),
        ('approved', '승인완료'),
        ('rejected', '거절됨'),
    ]
    
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='subscriptions', verbose_name='회원')
    plan = models.ForeignKey(MembershipPlan, on_delete=models.CASCADE, verbose_name='회원권')
    start_date = models.DateField(verbose_name='시작일')
    end_date = models.DateField(verbose_name='종료일')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='결제 금액')
    is_active = models.BooleanField(default=True, verbose_name='활성화')
    
    # 승인 관련
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='approved', verbose_name='승인 상태')
    payment_method = models.CharField(max_length=50, blank=True, verbose_name='결제 수단')
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='승인 일시')
    rejected_at = models.DateTimeField(null=True, blank=True, verbose_name='거절 일시')
    rejection_reason = models.TextField(blank=True, verbose_name='거절 사유')
    
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True, verbose_name='수정일')

    class Meta:
        verbose_name = '구독'
        verbose_name_plural = '구독 내역'
        ordering = ['-start_date']

    def __str__(self) -> str:
        return f"{self.member.full_name} - {self.plan.name}"


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='쿠폰 코드')
    discount_percent = models.PositiveIntegerField(default=0, verbose_name='할인율(%)')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='할인 금액')
    valid_from = models.DateField(verbose_name='유효 시작일')
    valid_until = models.DateField(verbose_name='유효 종료일')
    is_active = models.BooleanField(default=True, verbose_name='활성화')
    used_by = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='사용한 회원')

    class Meta:
        verbose_name = '쿠폰'
        verbose_name_plural = '쿠폰'

    def __str__(self) -> str:
        return self.code


class Revenue(models.Model):
    member = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='회원')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='금액')
    date = models.DateField(verbose_name='날짜')
    source = models.CharField(max_length=100, blank=True, verbose_name='출처')
    memo = models.TextField(blank=True, verbose_name='메모')

    class Meta:
        verbose_name = '매출'
        verbose_name_plural = '매출 기록'
        ordering = ['-date']

    def __str__(self) -> str:
        return f"{self.date} - {self.amount}원"


class Attendance(models.Model):
    STATUS_CHOICES = [('출석', '출석'), ('지각', '지각'), ('결석', '결석')]
    
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='attendances', verbose_name='회원')
    date = models.DateField(verbose_name='날짜')
    time = models.TimeField(verbose_name='시간')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='출석', verbose_name='상태')
    notes = models.TextField(blank=True, verbose_name='메모')

    class Meta:
        verbose_name = '출석'
        verbose_name_plural = '출석 기록'
        ordering = ['-date', '-time']

    def __str__(self) -> str:
        return f"{self.member.full_name} - {self.date}"


class Locker(models.Model):
    no = models.CharField(max_length=20, unique=True, verbose_name='락커 번호')
    member = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='사용 회원')
    start_date = models.DateField(null=True, blank=True, verbose_name='시작일')
    expire_date = models.DateField(null=True, blank=True, verbose_name='만료일')
    is_available = models.BooleanField(default=True, verbose_name='사용 가능')

    class Meta:
        verbose_name = '락커'
        verbose_name_plural = '락커'
        ordering = ['no']

    def __str__(self) -> str:
        return f"락커 {self.no}"


class Coach(models.Model):
    name = models.CharField(max_length=100, verbose_name='이름')
    phone = models.CharField(max_length=20, blank=True, verbose_name='전화번호')
    email = models.EmailField(blank=True, verbose_name='이메일')
    specialty = models.CharField(max_length=200, blank=True, verbose_name='전문 분야')
    bio = models.TextField(blank=True, verbose_name='소개')

    class Meta:
        verbose_name = '코치'
        verbose_name_plural = '코치'

    def __str__(self) -> str:
        return self.name


class WOD(models.Model):
    CATEGORY_CHOICES = [
        ('CrossFit', 'CrossFit'),
        ('주짓수', '주짓수'),
        ('복싱', '복싱'),
        ('MMA', 'MMA'),
        ('요가', '요가'),
        ('PT', 'PT'),
        ('기타', '기타'),
    ]
    
    LEVEL_CHOICES = [
        ('초급', '초급'),
        ('중급', '중급'),
        ('고급', '고급'),
        ('전체', '전체'),
    ]
    
    date = models.DateField(verbose_name='날짜')
    time_start = models.TimeField(verbose_name='시작 시간')
    time_end = models.TimeField(verbose_name='종료 시간')
    title = models.CharField(max_length=200, verbose_name='제목')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='CrossFit', verbose_name='종목')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='전체', verbose_name='레벨')
    description = models.TextField(verbose_name='설명')
    
    # 운동 구성
    warmup = models.TextField(blank=True, verbose_name='워밍업')
    strength = models.TextField(blank=True, verbose_name='스트렝스')
    wod_detail = models.TextField(blank=True, verbose_name='WOD 상세')
    rounds = models.PositiveIntegerField(null=True, blank=True, verbose_name='라운드 수')
    time_cap = models.PositiveIntegerField(null=True, blank=True, verbose_name='타임캡 (분)')
    
    # 운동 목록 (JSON)
    exercises = models.JSONField(default=list, blank=True, verbose_name='운동 목록')
    # 예: [{"name": "스쿼트", "reps": 10, "sets": 3, "weight": "60kg"}, ...]
    
    coach = models.ForeignKey(Coach, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='담당 코치')
    max_participants = models.PositiveIntegerField(default=20, verbose_name='최대 인원')
    registered_count = models.PositiveIntegerField(default=0, verbose_name='등록 인원')
    
    notes = models.TextField(blank=True, verbose_name='메모')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')

    class Meta:
        verbose_name = 'WOD'
        verbose_name_plural = 'WOD'
        ordering = ['-date', '-time_start']

    def __str__(self) -> str:
        return f"{self.date} {self.time_start} - {self.title}"


class MemberNote(models.Model):
    """회원 상담/메모 기록"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='member_notes', verbose_name='회원')
    date = models.DateTimeField(auto_now_add=True, verbose_name='작성일')
    note_type = models.CharField(max_length=50, choices=[
        ('상담', '상담'), ('전화', '전화'), ('문자', '문자'), ('일반', '일반'), ('주의', '주의')
    ], default='일반', verbose_name='유형')
    content = models.TextField(verbose_name='내용')
    author = models.CharField(max_length=100, blank=True, verbose_name='작성자')

    class Meta:
        verbose_name = '회원 메모'
        verbose_name_plural = '회원 메모'
        ordering = ['-date']

    def __str__(self) -> str:
        return f"{self.member.full_name} - {self.date.strftime('%Y-%m-%d')}"


class LevelHistory(models.Model):
    """단수/레벨 변경 이력"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='level_history', verbose_name='회원')
    previous_level = models.CharField(max_length=20, blank=True, verbose_name='이전 단수')
    new_level = models.CharField(max_length=20, verbose_name='새 단수')
    date = models.DateField(auto_now_add=True, verbose_name='변경일')
    notes = models.TextField(blank=True, verbose_name='메모')

    class Meta:
        verbose_name = '단수 이력'
        verbose_name_plural = '단수 이력'
        ordering = ['-date']

    def __str__(self) -> str:
        return f"{self.member.full_name} - {self.previous_level} → {self.new_level}"


# 회원용 앱 모델들

class UserProfile(models.Model):
    """회원 앱 사용자 프로필"""
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='user_profile', verbose_name='회원')
    ai_character_url = models.TextField(blank=True, verbose_name='AI 캐릭터 이미지 URL')
    character_style = models.CharField(max_length=50, default='realistic', verbose_name='캐릭터 스타일')
    bio = models.TextField(blank=True, verbose_name='자기소개')
    instagram = models.CharField(max_length=100, blank=True, verbose_name='인스타그램')
    
    # 운동 목표
    goal_weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='목표 체중')
    goal_type = models.CharField(max_length=50, blank=True, verbose_name='목표 유형')
    
    # 설정
    is_public = models.BooleanField(default=True, verbose_name='프로필 공개')
    allow_messages = models.BooleanField(default=True, verbose_name='메시지 허용')
    push_enabled = models.BooleanField(default=True, verbose_name='푸시 알림')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '회원 프로필'
        verbose_name_plural = '회원 프로필들'
    
    def __str__(self):
        return f"{self.member.full_name} 프로필"


class WorkoutLog(models.Model):
    """운동 기록"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='workout_logs', verbose_name='회원')
    wod = models.ForeignKey(WOD, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='오늘의 운동')
    
    date = models.DateField(verbose_name='날짜')
    duration_minutes = models.PositiveIntegerField(default=0, verbose_name='운동 시간(분)')
    calories_burned = models.PositiveIntegerField(default=0, verbose_name='소모 칼로리')
    
    # 운동 상세
    exercises = models.TextField(blank=True, verbose_name='운동 내용')
    notes = models.TextField(blank=True, verbose_name='메모')
    feeling = models.CharField(max_length=20, blank=True, verbose_name='컨디션')  # 최고, 좋음, 보통, 힘듦
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '운동 기록'
        verbose_name_plural = '운동 기록들'
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.member.full_name} - {self.date}"


class MealLog(models.Model):
    """식단 기록"""
    MEAL_TYPE_CHOICES = [
        ('breakfast', '아침'),
        ('lunch', '점심'),
        ('dinner', '저녁'),
        ('snack', '간식'),
    ]
    
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='meal_logs', verbose_name='회원')
    date = models.DateField(verbose_name='날짜')
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES, verbose_name='식사 유형')
    
    food_name = models.CharField(max_length=200, verbose_name='음식명')
    calories = models.PositiveIntegerField(default=0, verbose_name='칼로리')
    protein = models.DecimalField(max_digits=6, decimal_places=2, default=0, verbose_name='단백질(g)')
    carbs = models.DecimalField(max_digits=6, decimal_places=2, default=0, verbose_name='탄수화물(g)')
    fat = models.DecimalField(max_digits=6, decimal_places=2, default=0, verbose_name='지방(g)')
    
    photo_url = models.TextField(blank=True, verbose_name='사진 URL')
    notes = models.TextField(blank=True, verbose_name='메모')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '식단 기록'
        verbose_name_plural = '식단 기록들'
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.member.full_name} - {self.get_meal_type_display()} - {self.date}"


class Post(models.Model):
    """커뮤니티 게시글"""
    CATEGORY_CHOICES = [
        ('general', '자유게시판'),
        ('workout', '운동정보'),
        ('nutrition', '식단'),
        ('question', '질문'),
        ('success', '성공사례'),
        ('review', '리뷰'),
    ]
    
    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='posts', verbose_name='작성자')
    title = models.CharField(max_length=200, verbose_name='제목', default='')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general', verbose_name='카테고리')
    content = models.TextField(verbose_name='내용')
    images = models.TextField(blank=True, verbose_name='이미지 URLs (JSON)')
    
    # 태그
    tags = models.TextField(blank=True, verbose_name='태그')
    
    # 통계
    like_count = models.PositiveIntegerField(default=0, verbose_name='좋아요 수')
    comment_count = models.PositiveIntegerField(default=0, verbose_name='댓글 수')
    share_count = models.PositiveIntegerField(default=0, verbose_name='공유 수')
    view_count = models.PositiveIntegerField(default=0, verbose_name='조회 수')
    
    # 설정
    is_pinned = models.BooleanField(default=False, verbose_name='고정됨')
    is_public = models.BooleanField(default=True, verbose_name='공개')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='작성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '게시글'
        verbose_name_plural = '게시글들'
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return f"{self.author.full_name} - {self.created_at.strftime('%Y-%m-%d')}"


class Comment(models.Model):
    """댓글"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', verbose_name='게시글')
    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='comments', verbose_name='작성자')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name='부모 댓글')
    
    content = models.TextField(verbose_name='내용')
    like_count = models.PositiveIntegerField(default=0, verbose_name='좋아요 수')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='작성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '댓글'
        verbose_name_plural = '댓글들'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.author.full_name} - {self.content[:20]}"


class Like(models.Model):
    """좋아요"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='likes', verbose_name='회원')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name='likes', verbose_name='게시글')
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True, related_name='likes', verbose_name='댓글')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    
    class Meta:
        verbose_name = '좋아요'
        verbose_name_plural = '좋아요들'
        unique_together = [['member', 'post'], ['member', 'comment']]
    
    def __str__(self):
        if self.post:
            return f"{self.member.full_name} - 게시글 {self.post.id}"
        return f"{self.member.full_name} - 댓글 {self.comment.id}"


class Story(models.Model):
    """스토리"""
    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='stories', verbose_name='작성자')
    image_url = models.TextField(verbose_name='이미지 URL')
    content = models.TextField(blank=True, verbose_name='내용')
    
    view_count = models.PositiveIntegerField(default=0, verbose_name='조회 수')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='작성일')
    expires_at = models.DateTimeField(verbose_name='만료일')  # 24시간 후
    
    class Meta:
        verbose_name = '스토리'
        verbose_name_plural = '스토리들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.author.full_name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class ChatRoom(models.Model):
    """채팅방"""
    ROOM_TYPE_CHOICES = [
        ('direct', '1:1 채팅'),
        ('group', '그룹 채팅'),
    ]
    
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='direct', verbose_name='방 유형')
    name = models.CharField(max_length=200, blank=True, verbose_name='방 이름')
    members = models.ManyToManyField(Member, related_name='chat_rooms', verbose_name='참여자')
    
    last_message = models.TextField(blank=True, verbose_name='마지막 메시지')
    last_message_at = models.DateTimeField(null=True, blank=True, verbose_name='마지막 메시지 시간')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '채팅방'
        verbose_name_plural = '채팅방들'
        ordering = ['-last_message_at']
    
    def __str__(self):
        if self.name:
            return self.name
        return f"채팅방 {self.id}"


class ChatMessage(models.Model):
    """채팅 메시지"""
    MESSAGE_TYPE_CHOICES = [
        ('text', '텍스트'),
        ('image', '이미지'),
        ('file', '파일'),
        ('system', '시스템'),
    ]
    
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages', verbose_name='채팅방')
    sender = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='sent_messages', verbose_name='발신자')
    
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text', verbose_name='메시지 유형')
    content = models.TextField(verbose_name='내용')
    file_url = models.TextField(blank=True, verbose_name='파일 URL')
    
    is_read = models.BooleanField(default=False, verbose_name='읽음')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='읽은 시간')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='전송 시간')
    
    class Meta:
        verbose_name = '채팅 메시지'
        verbose_name_plural = '채팅 메시지들'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender.full_name}: {self.content[:30]}"


class Notification(models.Model):
    """알림"""
    NOTIFICATION_TYPE_CHOICES = [
        ('like', '좋아요'),
        ('comment', '댓글'),
        ('mention', '멘션'),
        ('follow', '팔로우'),
        ('message', '메시지'),
        ('workout', '운동'),
        ('system', '시스템'),
    ]
    
    recipient = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='notifications', verbose_name='수신자')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES, verbose_name='알림 유형')
    
    title = models.CharField(max_length=200, verbose_name='제목')
    content = models.TextField(verbose_name='내용')
    link = models.CharField(max_length=500, blank=True, verbose_name='링크')
    
    is_read = models.BooleanField(default=False, verbose_name='읽음')
    read_at = models.DateTimeField(null=True, blank=True, verbose_name='읽은 시간')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    
    class Meta:
        verbose_name = '알림'
        verbose_name_plural = '알림들'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.recipient.full_name} - {self.title}"
