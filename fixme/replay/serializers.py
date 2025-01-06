from rest_framework import serializers
from .models import ReplaySession, ReplayLog, ReplayStatusTransitionLog

class ReplayLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReplayLog
        fields = "__all__"

class ReplayStatusTransitionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReplayStatusTransitionLog
        fields = "__all__"

class ReplaySessionSerializer(serializers.ModelSerializer):
    logs = ReplayLogSerializer(many=True, read_only=True)
    transition_logs = ReplayStatusTransitionLogSerializer(many=True, read_only=True)

    class Meta:
        model = ReplaySession
        fields = "__all__"
