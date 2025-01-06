from rest_framework.viewsets import ModelViewSet
from .models import Task, TaskTransitionLog
from .serializers import TaskSerializer, TaskTransitionLogSerializer


class TaskViewSet(ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TaskTransitionLogViewSet(ModelViewSet):
    queryset = TaskTransitionLog.objects.all()
    serializer_class = TaskTransitionLogSerializer