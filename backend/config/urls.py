"""Eco Qadam Django project URL configuration."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

API_V1 = "api/v1/"

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path(f"{API_V1}auth/", include("apps.users.urls")),
    path(f"{API_V1}reports/", include("apps.reports.urls")),
    path(f"{API_V1}map/", include("apps.reports.map_urls")),
    path(f"{API_V1}withdrawals/", include("apps.withdrawals.urls")),
    path(f"{API_V1}", include("apps.transactions.urls")),
    path(f"{API_V1}notifications/", include("apps.notifications.urls")),
    path(f"{API_V1}admin/", include("apps.dashboard.urls")),
    path(f"{API_V1}bot/", include("apps.bot.urls")),
    # API docs
    path(f"{API_V1}schema/", SpectacularAPIView.as_view(), name="schema"),
    path(f"{API_V1}docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Uploaded media must be served in production too (Railway / gunicorn)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)