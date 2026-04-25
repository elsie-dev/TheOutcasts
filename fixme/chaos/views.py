import os

import httpx
from groq import Groq
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
from .models import ChaosConfig, ChaosEvent, RegisteredApp
from .serializers import ChaosConfigSerializer, ChaosEventSerializer, RegisteredAppSerializer

_VALID_SCENARIOS = ["MEMORY_LEAK", "NETWORK_LATENCY", "ERROR_RAIN", "LATENCY", "SMS_BLOCK"]
# Scenarios handled by an external microservice — proxied to the app's base_url
_EXTERNAL_SCENARIOS = {"LATENCY", "SMS_BLOCK"}
# ElevenLabs voice — "Adam" (pre-made, guaranteed on free tier)
_ELEVENLABS_VOICE_ID = "pNInz6obpgDQGcFmaJgB"


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def apps_list(request):
    """List all registered target applications, or register a new one."""
    if request.method == "POST":
        serializer = RegisteredAppSerializer(data=request.data)
        if serializer.is_valid():
            app = serializer.save()
            return Response(RegisteredAppSerializer(app).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    apps = RegisteredApp.objects.prefetch_related('chaos_configs').all()
    return Response(RegisteredAppSerializer(apps, many=True).data)


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
    Body: { "scenario": "MEMORY_LEAK" | "NETWORK_LATENCY" | "ERROR_RAIN", "app_id": <int> (optional) }
    """
    scenario = request.data.get("scenario")
    if scenario not in _VALID_SCENARIOS:
        return Response(
            {"error": f"scenario must be one of {_VALID_SCENARIOS}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    app = None
    app_id = request.data.get("app_id")
    if app_id:
        try:
            app = RegisteredApp.objects.get(pk=app_id)
        except RegisteredApp.DoesNotExist:
            return Response({"error": f"App with id {app_id} not found"}, status=status.HTTP_404_NOT_FOUND)

    # External scenarios are proxied to the app's own chaos API
    if scenario in _EXTERNAL_SCENARIOS:
        if not app or not app.base_url:
            return Response(
                {"error": f"{scenario} requires a target app with a base_url configured"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            r = httpx.post(
                f"{app.base_url}/api/v1/chaos/inject",
                json={"scenario": scenario},
                timeout=10.0,
            )
            r.raise_for_status()
        except Exception as exc:
            return Response({"error": f"Failed to reach {app.name}: {exc}"}, status=status.HTTP_502_BAD_GATEWAY)

    config, _ = ChaosConfig.objects.get_or_create(scenario=scenario)
    if config.is_active:
        return Response({"detail": f"{scenario} is already active"})

    config.is_active = True
    config.activated_at = timezone.now()
    config.deactivated_at = None
    config.app = app
    config.save()

    if scenario == "MEMORY_LEAK":
        state.start_memory_leak()
    elif scenario == "NETWORK_LATENCY":
        state.start_network_latency()
    elif scenario == "ERROR_RAIN":
        state.start_error_rain()

    # Update app status
    if app:
        app.status = "DOWN" if scenario == "ERROR_RAIN" else "DEGRADED"
        app.save()

    # Auto-create an incident that engineers can track & resolve
    app_label = f" on {app.name}" if app else ""
    task = Task.objects.create(
        title=f"INCIDENT: {scenario.replace('_', ' ').title()} detected{app_label}",
        description=(
            f"Chaos scenario '{scenario}' was injected{app_label} at {timezone.now().isoformat()}. "
            "Investigate impact and resolve."
        ),
        status="PENDING",
    )

    ChaosEvent.objects.bulk_create(
        [
            ChaosEvent(
                scenario=scenario,
                event_type="INJECTED",
                message=f"Scenario {scenario} activated{app_label}.",
                task=task,
                app=app,
            ),
            ChaosEvent(
                scenario=scenario,
                event_type="INCIDENT_CREATED",
                message=f"Incident task #{task.id} auto-created.",
                task=task,
                app=app,
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
        configs = list(ChaosConfig.objects.filter(is_active=True).select_related('app'))
    else:
        configs = list(ChaosConfig.objects.filter(scenario=scenario, is_active=True).select_related('app'))

    stopped = []
    for cfg in configs:
        app = cfg.app
        cfg.is_active = False
        cfg.deactivated_at = timezone.now()
        cfg.save()

        if cfg.scenario in _EXTERNAL_SCENARIOS:
            if app and app.base_url:
                try:
                    httpx.post(
                        f"{app.base_url}/api/v1/chaos/stop",
                        timeout=10.0,
                    )
                except Exception:
                    pass  # best-effort — log the event regardless
        elif cfg.scenario == "MEMORY_LEAK":
            state.stop_memory_leak()
        elif cfg.scenario == "NETWORK_LATENCY":
            state.stop_network_latency()
        elif cfg.scenario == "ERROR_RAIN":
            state.stop_error_rain()

        ChaosEvent.objects.create(
            scenario=cfg.scenario,
            event_type="STOPPED",
            message=f"Scenario {cfg.scenario} stopped.",
            app=app,
        )
        stopped.append(cfg.scenario)

        # Restore app status if no more active scenarios on it
        if app and not app.chaos_configs.filter(is_active=True).exists():
            app.status = "HEALTHY"
            app.save()

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


@api_view(["POST"])
@permission_classes([AllowAny])
def analyze(request):
    """
    Call Claude to generate a plain-English incident diagnosis based on
    live metrics and active chaos scenarios.
    """
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return Response({"error": "GROQ_API_KEY not configured"}, status=500)

    process = psutil.Process(os.getpid())
    req_stats = state.get_request_stats()
    active = list(ChaosConfig.objects.filter(is_active=True).values_list("scenario", flat=True))
    mem_mb = round(process.memory_info().rss / 1024 / 1024, 1)
    cpu = psutil.cpu_percent(interval=None)

    scenario_labels = {
        "MEMORY_LEAK": "Memory Leak",
        "NETWORK_LATENCY": "Network Latency",
        "ERROR_RAIN": "Error Rain (HTTP 500s)",
        "LATENCY": "Payment Latency (STK Push delays)",
        "SMS_BLOCK": "SMS Block (notifications silently dropped)",
    }
    active_readable = [scenario_labels.get(s, s) for s in active]

    prompt = f"""You are a senior incident analyst on a live war room call.

System state right now:
- Active chaos: {active_readable if active_readable else ['None']}
- Memory: {mem_mb} MB | CPU: {cpu}% | Latency: {req_stats['avg_latency_ms']} ms | Errors: {req_stats['error_rate_pct']}%

Write exactly 3 short punchy sentences. First sentence: what is failing right now. Second sentence: how this is impacting the end user. Third sentence: what the engineer must do to fix it immediately.
No bullet points. No fluff. Maximum 60 words total."""

    try:
        client = Groq(api_key=api_key)
        chat = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=120,
            messages=[{"role": "user", "content": prompt}],
        )
        diagnosis = chat.choices[0].message.content.strip()
        return Response({"diagnosis": diagnosis})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def narrate(request):
    """
    Send diagnosis text to ElevenLabs TTS and return MP3 audio as base64.
    Body: { "text": "..." }
    """
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return Response({"error": "ELEVENLABS_API_KEY not configured"}, status=500)

    text = request.data.get("text", "").strip()
    if not text:
        return Response({"error": "text is required"}, status=400)

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{_ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    payload = {
        "text": text,
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.4, "similarity_boost": 0.8},
    }

    try:
        resp = httpx.post(url, json=payload, headers=headers, timeout=20)
        if resp.status_code != 200:
            return Response({"error": f"ElevenLabs error: {resp.text}"}, status=502)
        import base64
        audio_b64 = base64.b64encode(resp.content).decode("utf-8")
        return Response({"audio_b64": audio_b64, "mime": "audio/mpeg"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def mpesa_push(request):
    """
    Proxy an STK push request to the registered M-Pesa microservice.
    Body: { "app_id": <int>, "phone_number": "254...", "amount": 1 }
    """
    app_id = request.data.get("app_id")
    phone = request.data.get("phone_number", "")
    amount = request.data.get("amount", 1)

    if not app_id:
        return Response({"error": "app_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        app = RegisteredApp.objects.get(pk=app_id)
    except RegisteredApp.DoesNotExist:
        return Response({"error": "App not found"}, status=status.HTTP_404_NOT_FOUND)
    if not app.base_url:
        return Response({"error": "App has no base_url configured"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        r = httpx.post(
            f"{app.base_url}/api/v1/payment/stk-push",
            json={"phone_number": phone, "amount": amount},
            timeout=15.0,
        )
        return Response(r.json(), status=r.status_code)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(["GET"])
@permission_classes([AllowAny])
def mpesa_chaos_status(request):
    """
    Proxy the chaos status from the M-Pesa microservice.
    Query param: ?app_id=<int>
    """
    app_id = request.query_params.get("app_id")
    if not app_id:
        return Response({"error": "app_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        app = RegisteredApp.objects.get(pk=app_id)
    except RegisteredApp.DoesNotExist:
        return Response({"error": "App not found"}, status=status.HTTP_404_NOT_FOUND)
    if not app.base_url:
        return Response({"active_scenario": None}, status=status.HTTP_200_OK)

    try:
        r = httpx.get(f"{app.base_url}/api/v1/chaos/status", timeout=5.0)
        return Response(r.json(), status=r.status_code)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(["GET"])
@permission_classes([AllowAny])
def chaos_status(request):
    """Current scenario states + last 20 events — polled by the frontend."""
    configs = ChaosConfig.objects.select_related('app').all()
    events = ChaosEvent.objects.select_related("task", "app").order_by("-timestamp")[:20]
    return Response(
        {
            "scenarios": ChaosConfigSerializer(configs, many=True).data,
            "recent_events": ChaosEventSerializer(events, many=True).data,
        }
    )
