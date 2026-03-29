from rest_framework import serializers
from .models import ChaosConfig, ChaosEvent, RegisteredApp


class RegisteredAppSerializer(serializers.ModelSerializer):
    active_scenarios = serializers.SerializerMethodField()

    class Meta:
        model = RegisteredApp
        fields = ['id', 'name', 'description', 'base_url', 'status', 'created_at', 'active_scenarios']

    def get_active_scenarios(self, obj):
        return list(
            obj.chaos_configs.filter(is_active=True).values_list('scenario', flat=True)
        )


class ChaosConfigSerializer(serializers.ModelSerializer):
    app_id = serializers.IntegerField(source='app.id', read_only=True, allow_null=True)
    app_name = serializers.CharField(source='app.name', read_only=True, allow_null=True)

    class Meta:
        model = ChaosConfig
        fields = ['id', 'scenario', 'is_active', 'activated_at', 'deactivated_at', 'app_id', 'app_name']


class ChaosEventSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source='task.id', read_only=True, allow_null=True)
    task_title = serializers.CharField(source='task.title', read_only=True, allow_null=True)
    task_status = serializers.CharField(source='task.status', read_only=True, allow_null=True)
    app_id = serializers.IntegerField(source='app.id', read_only=True, allow_null=True)
    app_name = serializers.CharField(source='app.name', read_only=True, allow_null=True)

    class Meta:
        model = ChaosEvent
        fields = [
            'id',
            'scenario',
            'event_type',
            'message',
            'timestamp',
            'task_id',
            'task_title',
            'task_status',
            'app_id',
            'app_name',
        ]
