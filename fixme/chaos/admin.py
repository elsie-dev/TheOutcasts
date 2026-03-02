from django.contrib import admin
from .models import ChaosConfig, ChaosEvent


@admin.register(ChaosConfig)
class ChaosConfigAdmin(admin.ModelAdmin):
    list_display = ["scenario", "is_active", "activated_at", "deactivated_at"]
    list_filter = ["is_active", "scenario"]


@admin.register(ChaosEvent)
class ChaosEventAdmin(admin.ModelAdmin):
    list_display = ["scenario", "event_type", "message", "timestamp", "task"]
    list_filter = ["scenario", "event_type"]
    readonly_fields = ["timestamp"]
