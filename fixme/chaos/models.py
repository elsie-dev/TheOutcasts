from django.db import models


SCENARIO_CHOICES = [
    ("MEMORY_LEAK", "Memory Leak"),
    ("NETWORK_LATENCY", "Network Latency"),
    ("ERROR_RAIN", "Error Rain"),
]

EVENT_TYPES = [
    ("INJECTED", "Chaos Injected"),
    ("STOPPED", "Chaos Stopped"),
    ("INCIDENT_CREATED", "Incident Created"),
]


class ChaosConfig(models.Model):
    """One row per scenario — acts as a toggleable on/off switch."""

    scenario = models.CharField(max_length=20, choices=SCENARIO_CHOICES, unique=True)
    is_active = models.BooleanField(default=False)
    activated_at = models.DateTimeField(null=True, blank=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.scenario}: {'ON' if self.is_active else 'OFF'}"


class ChaosEvent(models.Model):
    """Append-only log of every chaos action and incident."""

    scenario = models.CharField(max_length=20, choices=SCENARIO_CHOICES)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    task = models.ForeignKey(
        "tasks.Task",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="chaos_events",
    )

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"[{self.scenario}] {self.event_type} @ {self.timestamp}"
