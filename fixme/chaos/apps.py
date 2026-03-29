from django.apps import AppConfig


class ChaosApp(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "fixme.chaos"
    label = "chaos"

    def ready(self) -> None:
        # Start background baseline traffic so Grafana shows live metrics at rest
        from . import state
        state.start_baseline_traffic()
