from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate
from django import forms

class CustomAdminAuthenticationForm(AuthenticationForm):
    """
    로그인 실패 시 상세한 이유를 보여주는 커스텀 인증 폼
    """
    error_messages = {
        'invalid_login': (
            "❌ 로그인 실패!\n\n"
            "입력하신 사용자 이름 또는 비밀번호가 올바르지 않습니다.\n\n"
            "올바른 정보:\n"
            "Username: admin\n"
            "Email: admin@pumpy.com\n"
            "Password: pumpy2025!\n\n"
            "※ Username 또는 Email 둘 다 사용 가능합니다."
        ),
        'inactive': (
            "❌ 비활성화된 계정입니다.\n\n"
            "이 계정은 현재 비활성화 상태입니다. 관리자에게 문의하세요."
        ),
    }
    
    def clean(self):
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')

        if username is not None and password:
            self.user_cache = authenticate(
                self.request,
                username=username,
                password=password,
            )
            if self.user_cache is None:
                raise forms.ValidationError(
                    self.error_messages['invalid_login'],
                    code='invalid_login',
                )
            else:
                self.confirm_login_allowed(self.user_cache)

        return self.cleaned_data

