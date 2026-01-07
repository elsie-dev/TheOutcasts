"""Main URLs module."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.decorators.cache import cache_page
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions


DOCS_PAGES_CACHE_TIMEOUT = 60 * 60

apipatterns = [
    path("auth/", include("fixme.authentication.urls")),
    path("tasks/", include("fixme.tasks.urls")),
    path("replay/", include("fixme.replay.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth", include("fixme.authentication.urls")),
    path("api/", include(apipatterns)),  # type: ignore
    path(
        "api/docs/",
        cache_page(DOCS_PAGES_CACHE_TIMEOUT)(SpectacularAPIView.as_view()),
        name="docs",
    ),
    path(
        "api/docs/swagger-ui/",
        cache_page(DOCS_PAGES_CACHE_TIMEOUT)(
            SpectacularSwaggerView.as_view(url_name="docs")
        ),
        name="swagger-ui",
    ),
    path(
        "api/docs/redoc/",
        cache_page(DOCS_PAGES_CACHE_TIMEOUT)(
            SpectacularRedocView.as_view(url_name="docs")
        ),
        name="redoc",
    ),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.ENVIRONMENT == "dev":
    schema_view = get_schema_view(
        openapi.Info(
            title="FixMe API",
            default_version="v1",
            description="API for the FixMe application",
        ),
        public=True,
        permission_classes=(permissions.AllowAny,),
    )

    urlpatterns += [
        path("silk/", include("silk.urls", namespace="silk")),
        path(
            "swagger/",
            schema_view.with_ui("swagger", cache_timeout=0),
            name="schema-swagger-ui",
        ),
        path(
            "redoc/",
            schema_view.with_ui("redoc", cache_timeout=0),
            name="schema-redoc",
        ),
    ]

if settings.DEBUG:
    urlpatterns += [
        path("__debug__/", include("debug_toolbar.urls")),
    ]
