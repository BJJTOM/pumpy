from django.contrib import admin
from django.urls import path, include
from members.admin_improved import pumpy_admin_site

urlpatterns = [
    path("admin/", pumpy_admin_site.urls),  # 커스텀 Pumpy Admin 사이트
    path("api/", include("members.urls")),
]





