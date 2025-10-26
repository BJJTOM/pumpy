from rest_framework import serializers
from .models import Notice, Banner


class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = [
            'id', 'gym', 'title', 'content', 'image',
            'is_active', 'is_pinned',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = [
            'id', 'gym', 'title', 'image', 'link',
            'order', 'is_active',
            'start_date', 'end_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

