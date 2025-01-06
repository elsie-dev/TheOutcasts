from rest_framework.routers import SimpleRouter
from .views import TaskViewSet, TaskTransitionLogViewSet

router = SimpleRouter()
router.register("tasks", TaskViewSet, basename="task")
router.register("logs", TaskTransitionLogViewSet, basename="task-log")

urlpatterns = router.urls