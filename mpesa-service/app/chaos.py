"""
Chaos state for the mpesa-service.
Controlled via POST /api/v1/chaos/inject and /api/v1/chaos/stop.
"""
import asyncio
import time
from typing import Optional

# ── active scenario ────────────────────────────────────────────────────
_active_scenario: Optional[str] = None  # LATENCY | SMS_BLOCK
_activated_at: Optional[float] = None
_event_log: list[dict] = []

SCENARIOS = {
    "LATENCY":   "Adds 5s delay to every STK push — simulates slow Daraja API",
    "SMS_BLOCK": "Blocks all Africa's Talking SMS notifications",
}


def get_status() -> dict:
    return {
        "active_scenario": _active_scenario,
        "activated_at": _activated_at,
        "uptime_seconds": round(time.time() - _activated_at, 1) if _activated_at else None,
        "recent_events": _event_log[-10:],
    }


def inject(scenario: str) -> dict:
    global _active_scenario, _activated_at
    scenario = scenario.upper()
    if scenario not in SCENARIOS:
        raise ValueError(f"Unknown scenario '{scenario}'. Choose from: {list(SCENARIOS)}")
    _active_scenario = scenario
    _activated_at = time.time()
    _log(f"INJECTED: {scenario}")
    return {"scenario": scenario, "description": SCENARIOS[scenario]}


def stop() -> dict:
    global _active_scenario, _activated_at
    stopped = _active_scenario
    _active_scenario = None
    _activated_at = None
    _log("STOPPED chaos")
    return {"stopped": stopped}


def _log(msg: str):
    _event_log.append({"ts": time.time(), "event": msg})
    if len(_event_log) > 50:
        _event_log.pop(0)


# ── guards called from mpesa.py and sms.py ─────────────────────────────

async def maybe_apply_latency():
    """Call at the start of STK push. Sleeps 5s under LATENCY scenario."""
    if _active_scenario == "LATENCY":
        _log("LATENCY: sleeping 5s on STK push")
        await asyncio.sleep(5)



def sms_blocked() -> bool:
    """Returns True when SMS_BLOCK is active."""
    if _active_scenario == "SMS_BLOCK":
        _log("SMS_BLOCK: dropping SMS")
        return True
    return False
