"""Replay views."""
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import ReplaySession, ReplayLog, ReplayStatusTransitionLog
from .serializers import (
    ReplaySessionSerializer,
    ReplayLogSerializer,
    ReplayStatusTransitionLogSerializer,
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter



class ReplaySessionViewSet(ModelViewSet):
    queryset = ReplaySession.objects.all()
    serializer_class = ReplaySessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "user", "created_at"]
    ordering_fields = ["created_at", "updated_at"]


class ReplayLogViewSet(ModelViewSet):
    queryset = ReplayLog.objects.all().select_related("replay")
    serializer_class = ReplayLogSerializer
    permission_classes = [IsAuthenticated]

class ReplayStatusTransitionLogViewSet(ModelViewSet):
    queryset = ReplayStatusTransitionLog.objects.all().select_related("replay_session")
    serializer_class = ReplayStatusTransitionLogSerializer
    permission_classes = [IsAuthenticated]
