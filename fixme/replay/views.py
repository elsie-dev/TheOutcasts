from rest_framework.viewsets import ModelViewSet
from .models import ReplaySession, ReplayLog, ReplayStatusTransitionLog
from .serializers import ReplaySessionSerializer, ReplayLogSerializer, ReplayStatusTransitionLogSerializer


class ReplaySessionViewSet(ModelViewSet):
    queryset = ReplaySession.objects.all()
    serializer_class = ReplaySessionSerializer


class ReplayLogViewSet(ModelViewSet):
    queryset = ReplayLog.objects.all()
    serializer_class = ReplayLogSerializer


class ReplayStatusTransitionLogViewSet(ModelViewSet):
    queryset = ReplayStatusTransitionLog.objects.all()
    serializer_class = ReplayStatusTransitionLogSerializer