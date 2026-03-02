"""
ChaosMiddleware — reads active scenarios from DB (cached for 1 s)
and applies the corresponding failure to incoming requests.

Excluded paths (chaos + metrics + admin) are never affected.
"""

import random
import time

from django.http import JsonResponse

from . import state

# Paths that chaos must never affect (control plane + observability)
_EXCLUDED = (
    "/api/chaos",
    "/api/metrics",
    "/admin",
    "/__debug__",
    "/static",
    "/silk",
)

# Module-level 1-second cache — avoids a DB hit on every single request
_cache: dict = {"scenarios": set(), "updated_at": 0.0}
_CACHE_TTL = 1.0  # seconds


def _active_scenarios() -> set:
    now = time.monotonic()
    if now - _cache["updated_at"] > _CACHE_TTL:
        try:
            from .models import ChaosConfig

            _cache["scenarios"] = set(
                ChaosConfig.objects.filter(is_active=True).values_list(
                    "scenario", flat=True
                )
            )
        except Exception:
            _cache["scenarios"] = set()
        _cache["updated_at"] = now
    return _cache["scenarios"]


class ChaosMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        # Never chaos-inject the control plane
        if any(path.startswith(p) for p in _EXCLUDED):
            return self.get_response(request)

        scenarios = _active_scenarios()
        start = time.monotonic()

        # ── Scenario: ERROR_RAIN ─────────────────────────────────────────────
        # Return HTTP 500 immediately on 40 % of requests
        if "ERROR_RAIN" in scenarios and random.random() < 0.4:
            elapsed_ms = round((time.monotonic() - start) * 1000, 1)
            state.record_request(elapsed_ms, is_error=True)
            return JsonResponse(
                {"error": "Service degraded — chaos: ERROR_RAIN active"},
                status=500,
            )

        # ── Scenario: NETWORK_LATENCY ────────────────────────────────────────
        # Block the request thread for 1–3 seconds before forwarding
        if "NETWORK_LATENCY" in scenarios:
            time.sleep(random.uniform(1.0, 3.0))

        response = self.get_response(request)

        elapsed_ms = round((time.monotonic() - start) * 1000, 1)
        state.record_request(elapsed_ms, is_error=response.status_code >= 500)

        return response
