"""Tasks serializers."""

from rest_framework import serializers
from .models import Task, TaskTransitionLog


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model."""
    class Meta:
        model = Task
        fields = "__all__"


class TaskTransitionLogSerializer(serializers.ModelSerializer):
    """Serializer for TaskTransitionLog model."""
    class Meta:
        model = TaskTransitionLog
        fields = "__all__"