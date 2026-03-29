from django.urls import path
from . import views

urlpatterns = [
    path("inject/", views.inject_chaos, name="chaos-inject"),
    path("stop/", views.stop_chaos, name="chaos-stop"),
    path("status/", views.chaos_status, name="chaos-status"),
    path("apps/", views.apps_list, name="chaos-apps"),
]
