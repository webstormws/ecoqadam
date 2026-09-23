from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.reports.models import WasteReport
from apps.reports.serializers import (
    ReportCreateSerializer,
    ReportDetailSerializer,
    ReportListSerializer,
)


class ReportViewSet(viewsets.ModelViewSet):
    """Users can only see/manage their own reports. Create is the only write action;
    status and reward are read-only for users."""

    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return (
            WasteReport.objects.select_related("user")
            .prefetch_related("images")
            .filter(user=self.request.user)
        )

    def get_serializer_class(self):
        if self.action == "create" or self.request.method == "POST":
            return ReportCreateSerializer
        if self.action == "retrieve":
            return ReportDetailSerializer
        return ReportListSerializer

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        data = ReportListSerializer(qs, many=True, context={"request": request}).data
        approved = list(qs.filter(status=WasteReport.Status.APPROVED))
        return Response(
            {
                "results": data,
                "summary": {
                    "total": qs.count(),
                    "approved": len(approved),
                    "pending": qs.filter(status=WasteReport.Status.PENDING).count(),
                    "rejected": qs.filter(status=WasteReport.Status.REJECTED).count(),
                    "earned": sum(r.reward_amount for r in approved),
                },
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = ReportCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        report = serializer.save()
        return Response(
            ReportDetailSerializer(report, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )