"""
Prometheus metric registry for the FixMe chaos demo.

Defined once at module level so gauges are never double-registered
across Django's auto-reloader restarts (prometheus_client raises
ValueError on duplicate registration otherwise).
"""

from prometheus_client import Gauge

memory_bytes = Gauge(
    "fixme_memory_bytes",
    "RSS memory of the Django process in bytes",
)
cpu_percent = Gauge(
    "fixme_cpu_percent",
    "CPU utilisation of the Django process (0–100)",
)
latency_ms_avg = Gauge(
    "fixme_latency_ms_avg",
    "Rolling average HTTP request latency in milliseconds (last 100 requests)",
)
request_count = Gauge(
    "fixme_request_count",
    "Total HTTP requests handled since last process restart",
)
error_count = Gauge(
    "fixme_error_count",
    "Total HTTP 5xx errors since last process restart",
)
error_rate_pct = Gauge(
    "fixme_error_rate_pct",
    "Current HTTP 5xx error rate as a percentage (0–100)",
)
chaos_active = Gauge(
    "fixme_chaos_active",
    "1 if the named chaos scenario is currently active, 0 otherwise",
    ["scenario"],
)
