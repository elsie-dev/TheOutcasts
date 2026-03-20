import os

import psutil
from django.http import HttpResponse
from django.utils import timezone
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from fixme.tasks.models import Task
from . import prom, state
from .models import ChaosConfig, ChaosEvent
from .serializers import ChaosConfigSerializer, ChaosEventSerializer

_VALID_SCENARIOS = ["MEMORY_LEAK", "NETWORK_LATENCY", "ERROR_RAIN"]


@api_view(["GET"])
@permission_classes([AllowAny])
def metrics(request):
    """Live system metrics — polled every 2 s by the frontend."""
    process = psutil.Process(os.getpid())
    mem = process.memory_info()
    req_stats = state.get_request_stats()
    active = list(
        ChaosConfig.objects.filter(is_active=True).values_list("scenario", flat=True)
    )
    return Response(
        {
            "cpu_percent": psutil.cpu_percent(interval=None),
            "memory_mb": round(mem.rss / 1024 / 1024, 2),
            "memory_percent": round(process.memory_percent(), 2),
            "active_scenarios": active,
            **req_stats,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def inject_chaos(request):
    """
    Activate a chaos scenario and create a matching incident Task.
    Body: { "scenario": "MEMORY_LEAK" | "NETWORK_LATENCY" | "ERROR_RAIN" }
    """
    scenario = request.data.get("scenario")
    if scenario not in _VALID_SCENARIOS:
        return Response(
            {"error": f"scenario must be one of {_VALID_SCENARIOS}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    config, _ = ChaosConfig.objects.get_or_create(scenario=scenario)
    if config.is_active:
        return Response({"detail": f"{scenario} is already active"})

    config.is_active = True
    config.activated_at = timezone.now()
    config.deactivated_at = None
    config.save()

    if scenario == "MEMORY_LEAK":
        state.start_memory_leak()
    elif scenario == "NETWORK_LATENCY":
        state.start_network_latency()
    elif scenario == "ERROR_RAIN":
        state.start_error_rain()

    # Auto-create an incident that engineers can track & resolve
    task = Task.objects.create(
        title=f"INCIDENT: {scenario.replace('_', ' ').title()} detected",
        description=(
            f"Chaos scenario '{scenario}' was injected at {timezone.now().isoformat()}. "
            "Investigate impact and resolve."
        ),
        status="PENDING",
    )

    ChaosEvent.objects.bulk_create(
        [
            ChaosEvent(
                scenario=scenario,
                event_type="INJECTED",
                message=f"Scenario {scenario} activated.",
                task=task,
            ),
            ChaosEvent(
                scenario=scenario,
                event_type="INCIDENT_CREATED",
                message=f"Incident task #{task.id} auto-created.",
                task=task,
            ),
        ]
    )

    return Response(
        {"detail": f"{scenario} injected", "incident_id": task.id},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def stop_chaos(request):
    """
    Deactivate one or all chaos scenarios.
    Body: { "scenario": "MEMORY_LEAK" } or { "scenario": "ALL" }
    """
    scenario = request.data.get("scenario", "ALL")

    if scenario == "ALL":
        configs = list(ChaosConfig.objects.filter(is_active=True))
    else:
        configs = list(ChaosConfig.objects.filter(scenario=scenario, is_active=True))

    stopped = []
    for cfg in configs:
        cfg.is_active = False
        cfg.deactivated_at = timezone.now()
        cfg.save()

        if cfg.scenario == "MEMORY_LEAK":
            state.stop_memory_leak()
        elif cfg.scenario == "NETWORK_LATENCY":
            state.stop_network_latency()
        elif cfg.scenario == "ERROR_RAIN":
            state.stop_error_rain()

        ChaosEvent.objects.create(
            scenario=cfg.scenario,
            event_type="STOPPED",
            message=f"Scenario {cfg.scenario} stopped.",
        )
        stopped.append(cfg.scenario)

    # Reset request metrics once no chaos scenario remains active
    if not ChaosConfig.objects.filter(is_active=True).exists():
        state.reset_stats()

    return Response({"stopped": stopped})


def prom_metrics(request):
    """
    Prometheus text-format scrape endpoint — consumed by Prometheus, not the frontend.
    Plain Django view (no DRF) so we can set the exact Content-Type required.
    """
    process = psutil.Process(os.getpid())
    stats = state.get_request_stats()
    active_scenarios = set(
        ChaosConfig.objects.filter(is_active=True).values_list("scenario", flat=True)
    )

    prom.memory_bytes.set(process.memory_info().rss)
    prom.cpu_percent.set(psutil.cpu_percent(interval=None))
    prom.latency_ms_avg.set(stats["avg_latency_ms"])
    prom.request_count.set(stats["total_requests"])
    prom.error_count.set(stats["error_count"])
    prom.error_rate_pct.set(stats["error_rate_pct"])

    for scenario in _VALID_SCENARIOS:
        prom.chaos_active.labels(scenario=scenario).set(
            1.0 if scenario in active_scenarios else 0.0
        )

    return HttpResponse(generate_latest(), content_type=CONTENT_TYPE_LATEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def chaos_status(request):
    """Current scenario states + last 20 events — polled by the frontend."""
    configs = ChaosConfig.objects.all()
    events = ChaosEvent.objects.select_related("task").order_by("-timestamp")[:20]
    return Response(
        {
            "scenarios": ChaosConfigSerializer(configs, many=True).data,
            "recent_events": ChaosEventSerializer(events, many=True).data,
        }
    )
