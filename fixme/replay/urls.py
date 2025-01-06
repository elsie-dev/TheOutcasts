from rest_framework.routers import SimpleRouter
from .views import ReplaySessionViewSet, ReplayLogViewSet, ReplayStatusTransitionLogViewSet


router = SimpleRouter()
router.register("sessions", ReplaySessionViewSet, basename="replay-session")
router.register("logs", ReplayLogViewSet, basename="replay-log")
router.register("transitions", ReplayStatusTransitionLogViewSet, basename="replay-transition")

urlpatterns = router.urls