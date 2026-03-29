"""
In-memory chaos state — no Celery needed.
All state resets on server restart, which is intentional for a demo.
"""

import collections
import random
import threading
import time

from . import prom as _prom

# ── Memory Leak ──────────────────────────────────────────────────────────────
_leak_data: list = []
_leak_thread: threading.Thread | None = None
_leak_stop = threading.Event()


def start_memory_leak() -> None:
    """Spawn a background thread that allocates ~1 MB every 500 ms."""
    global _leak_thread, _leak_stop, _leak_data
    _leak_stop = threading.Event()
    _leak_data = []

    def _loop() -> None:
        while not _leak_stop.is_set():
            _leak_data.append(b"\x00" * 1024 * 1024)
            time.sleep(0.5)

    _leak_thread = threading.Thread(target=_loop, daemon=True, name="chaos-memory-leak")
    _leak_thread.start()


def stop_memory_leak() -> None:
    global _leak_data
    _leak_stop.set()
    _leak_data = []  # release reference so GC can reclaim


# ── Network Latency simulator ─────────────────────────────────────────────────
_latency_thread: threading.Thread | None = None
_latency_stop = threading.Event()


def start_network_latency() -> None:
    """Spawn a background thread that records simulated high-latency requests."""
    global _latency_thread, _latency_stop
    _latency_stop = threading.Event()

    def _loop() -> None:
        while not _latency_stop.is_set():
            delay = random.uniform(1000.0, 3000.0)  
            time.sleep(delay / 1000.0)
            if not _latency_stop.is_set():
                record_request(delay, is_error=False)

    _latency_thread = threading.Thread(
        target=_loop, daemon=True, name="chaos-network-latency"
    )
    _latency_thread.start()


def stop_network_latency() -> None:
    _latency_stop.set()
    with _lock:
        _latencies.clear()
    _prom.latency_ms_avg.set(0)


# ── Error Rain simulator ──────────────────────────────────────────────────────
_error_rain_thread: threading.Thread | None = None
_error_rain_stop = threading.Event()


def start_error_rain() -> None:
    """Spawn a background thread that records simulated requests with 40% errors."""
    global _error_rain_thread, _error_rain_stop
    _error_rain_stop = threading.Event()

    def _loop() -> None:
        while not _error_rain_stop.is_set():
            time.sleep(0.5)
            if not _error_rain_stop.is_set():
                is_error = random.random() < 0.4
                record_request(random.uniform(5.0, 50.0), is_error=is_error)

    _error_rain_thread = threading.Thread(
        target=_loop, daemon=True, name="chaos-error-rain"
    )
    _error_rain_thread.start()


def stop_error_rain() -> None:
    global _error_count, _request_count
    _error_rain_stop.set()
    with _lock:
        _error_count = 0
        _request_count = 0
    _prom.error_rate_pct.set(0)
    _prom.error_count.set(0)
    _prom.request_count.set(0)


# ── Request metrics ───────────────────────────────────────────────────────────
_lock = threading.Lock()
_error_count = 0
_request_count = 0
_latencies: collections.deque = collections.deque(maxlen=100)


def record_request(latency_ms: float, is_error: bool = False) -> None:
    global _error_count, _request_count
    with _lock:
        _request_count += 1
        _latencies.append(latency_ms)
        if is_error:
            _error_count += 1


def get_request_stats() -> dict:
    with _lock:
        avg = sum(_latencies) / len(_latencies) if _latencies else 0.0
        rate = (_error_count / _request_count * 100) if _request_count else 0.0
        return {
            "total_requests": _request_count,
            "error_count": _error_count,
            "error_rate_pct": round(rate, 1),
            "avg_latency_ms": round(avg, 1),
        }


def reset_stats() -> None:
    global _error_count, _request_count
    with _lock:
        _error_count = 0
        _request_count = 0
        _latencies.clear()
    _prom.latency_ms_avg.set(0)
    _prom.error_rate_pct.set(0)
    _prom.error_count.set(0)
    _prom.request_count.set(0)


# ── Baseline Traffic Simulator ────────────────────────────────────────────────
_baseline_thread: threading.Thread | None = None
_baseline_stop = threading.Event()


def start_baseline_traffic() -> None:
    """
    Simulate steady background traffic so Grafana shows realistic non-flat
    metrics even before any chaos scenario is injected.
    ~3-5 req/s, 30-150 ms latency, ~1% error rate.
    """
    global _baseline_thread, _baseline_stop
    if _baseline_thread and _baseline_thread.is_alive():
        return  # already running
    _baseline_stop = threading.Event()

    def _loop() -> None:
        while not _baseline_stop.is_set():
            time.sleep(random.uniform(0.2, 0.4))
            if not _baseline_stop.is_set():
                latency = random.uniform(30.0, 150.0)
                record_request(latency, is_error=False)  # clean baseline — no errors

    _baseline_thread = threading.Thread(
        target=_loop, daemon=True, name="chaos-baseline-traffic"
    )
    _baseline_thread.start()
