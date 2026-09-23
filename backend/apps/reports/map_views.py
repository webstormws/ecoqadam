"""Lightweight map endpoint: own reports with coordinates only."""

from django.db.models import F
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class MyMapReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = (
            request.user.reports.values("id", "latitude", "longitude", "status", "reward_amount", "created_at")
            .annotate(
                title=F("waste_type"),
            )
            .order_by("-created_at")
        )
        return Response({"results": list(rows)})