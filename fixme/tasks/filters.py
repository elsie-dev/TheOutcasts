from django_filters import rest_framework as filters
from .models import Task


class TaskFilter(filters.FilterSet):
    """Filter for Task."""
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")

    class Meta:
        model = Task
        fields = ["title", "status", "created_at"]
