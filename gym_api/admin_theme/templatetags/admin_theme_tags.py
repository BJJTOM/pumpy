from django import template
from django.contrib import admin
from django.utils.text import capfirst

register = template.Library()


@register.simple_tag(takes_context=True)
def admin_app_list(context):
    """관리자 페이지의 앱 및 모델 목록을 반환"""
    request = context.get("request")
    if not request:
        return []
    
    site = admin.site
    app_dict = site._build_app_dict(request)
    
    app_list = []
    for app_label in sorted(app_dict):
        app = app_dict[app_label]
        models = sorted(app["models"], key=lambda m: m["name"])
        app_list.append({
            "name": capfirst(app["name"]),
            "app_label": app_label,
            "models": [
                {
                    "name": m["name"],
                    "admin_url": m.get("admin_url"),
                    "object_name": m.get("object_name", "")
                }
                for m in models
            ],
        })
    return app_list

