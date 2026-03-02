from rest_framework import serializers
from .models import ChaosConfig, ChaosEvent


class ChaosConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChaosConfig
        fields = ["id", "scenario", "is_active", "activated_at", "deactivated_at"]


class ChaosEventSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="task.id", read_only=True, allow_null=True)
    task_title = serializers.CharField(source="task.title", read_only=True, allow_null=True)
    task_status = serializers.CharField(source="task.status", read_only=True, allow_null=True)

    class Meta:
        model = ChaosEvent
        fields = [
            "id",
            "scenario",
            "event_type",
            "message",
            "timestamp",
            "task_id",
            "task_title",
            "task_status",
        ]
