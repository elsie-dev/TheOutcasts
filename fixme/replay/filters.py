from django_filters import rest_framework as filters
from .models import ReplaySession


class ReplaySessionFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")

    class Meta:
        model = ReplaySession
        fields = ["user", "status", "created_at"]