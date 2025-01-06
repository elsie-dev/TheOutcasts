"""Replay serializers."""

from rest_framework import serializers
from .models import ReplaySession, ReplayLog, ReplayStatusTransitionLog


class ReplaySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReplaySession
        fields = "__all__"


class ReplayLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReplayLog
        fields = "__all__"


class ReplayStatusTransitionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReplayStatusTransitionLog
        fields = "__all__"