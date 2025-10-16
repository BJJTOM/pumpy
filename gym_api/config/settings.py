import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key")
DEBUG = os.environ.get("DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = ['*']  # 모든 호스트 허용 (LocalTunnel 포함)

INSTALLED_APPS = [
    "jazzmin",  # Jazzmin을 admin보다 먼저
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "members",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "ko-kr"
TIME_ZONE = "Asia/Seoul"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS 설정 - LocalTunnel과 외부 접속을 위한 설정
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pumpy-app-2025.loca.lt",
    "http://172.30.1.44:3000",
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Jazzmin 설정
JAZZMIN_SETTINGS = {
    # 사이트 제목
    "site_title": "💪 펌피 관리자",
    "site_header": "💪 Pumpy Gym",
    "site_brand": "펌피 체육관",
    "site_logo": None,  # 로고 이미지 경로 (나중에 추가 가능)
    "login_logo": None,
    "login_logo_dark": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    
    # 환영 메시지
    "welcome_sign": "펌피 관리자 페이지에 오신 것을 환영합니다! 💪",
    
    # 저작권
    "copyright": "Pumpy Gym Management System 2025",
    
    # 검색 모델
    "search_model": ["members.Member"],
    
    # 사용자 아바타
    "user_avatar": None,
    
    # 상단 메뉴 링크
    "topmenu_links": [
        {"name": "홈", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "회원 앱", "url": "/app", "new_window": True},
        {"name": "출석 체크", "url": "/checkin", "new_window": True},
        {"model": "members.Member"},
    ],
    
    # 사용자 메뉴
    "usermenu_links": [
        {"name": "프로필", "url": "admin:index", "icon": "fas fa-user"},
        {"model": "auth.user"}
    ],
    
    # 사이드바 설정
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    
    # 순서 설정
    "order_with_respect_to": ["members", "auth"],
    
    # 아이콘 설정
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "members.Member": "fas fa-user-friends",
        "members.MembershipPlan": "fas fa-id-card",
        "members.Attendance": "fas fa-calendar-check",
        "members.Revenue": "fas fa-dollar-sign",
        "members.Coach": "fas fa-dumbbell",
        "members.Locker": "fas fa-key",
        "members.WOD": "fas fa-running",
    },
    
    # 기본 아이콘 클래스
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    
    # 관련 모달 설정
    "related_modal_active": False,
    
    # 커스텀 CSS
    "custom_css": "admin/css/custom_admin.css",
    "custom_js": None,
    
    # UI 빌더 표시
    "show_ui_builder": False,
    
    # 변경 폼 형식
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
    
    # 언어 선택
    "language_chooser": False,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-primary",
    "accent": "accent-primary",
    "navbar": "navbar-primary navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": True,
    "theme": "lux",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}



