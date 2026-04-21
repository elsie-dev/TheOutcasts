from django.db import models


SCENARIO_CHOICES = [
    ("MEMORY_LEAK", "Memory Leak"),
    ("NETWORK_LATENCY", "Network Latency"),
    ("ERROR_RAIN", "Error Rain"),
    ("LATENCY", "Payment Latency"),
    ("SMS_BLOCK", "SMS Block"),
]

EVENT_TYPES = [
    ("INJECTED", "Chaos Injected"),
    ("STOPPED", "Chaos Stopped"),
    ("INCIDENT_CREATED", "Incident Created"),
]

APP_STATUS_CHOICES = [
    ("HEALTHY", "Healthy"),
    ("DEGRADED", "Degraded"),
    ("DOWN", "Down"),
]


class RegisteredApp(models.Model):
    """A target application that can have chaos scenarios injected into it."""

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    base_url = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=APP_STATUS_CHOICES, default="HEALTHY")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ChaosConfig(models.Model):
    """One row per scenario — acts as a toggleable on/off switch."""

    scenario = models.CharField(max_length=20, choices=SCENARIO_CHOICES, unique=True)
    is_active = models.BooleanField(default=False)
    activated_at = models.DateTimeField(null=True, blank=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)
    app = models.ForeignKey(
        RegisteredApp,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="chaos_configs",
    )

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
    app = models.ForeignKey(
        RegisteredApp,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="chaos_events",
    )

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"[{self.scenario}] {self.event_type} @ {self.timestamp}"
