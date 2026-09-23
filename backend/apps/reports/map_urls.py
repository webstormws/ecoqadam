from django.urls import path

from apps.reports.map_views import MyMapReportsView

urlpatterns = [
    path("my/", MyMapReportsView.as_view(), name="map-my-reports"),
]