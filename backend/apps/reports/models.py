import uuid
from decimal import Decimal

from django.core.validators import DecimalValidator, MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from apps.users.models import User


class WasteReport(models.Model):
    class Meta:
        db_table = "reports_waste_report"
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(latitude__range=(-90, 90)),
                name="report_lat_range",
            ),
            models.CheckConstraint(
                check=models.Q(longitude__range=(-180, 180)),
                name="report_lng_range",
            ),
        ]

    class Status(models.TextChoices):
        PENDING = "PENDING", "Ko'rib chiqilmoqda"
        APPROVED = "APPROVED", "Tasdiqlandi"
        REJECTED = "REJECTED", "Rad etildi"

    class WasteType(models.TextChoices):
        PLASTIC = "plastic", "Plastik"
        PAPER = "paper", "Qog'oz"
        GLASS = "glass", "Shisha"
        HOUSEHOLD = "household", "Maishiy chiqindi"
        OTHER = "other", "Boshqa"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports")
    waste_type = models.CharField(max_length=16, choices=WasteType.choices, default=WasteType.OTHER)
    description = models.TextField(blank=True, default="", max_length=1000)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    reward_amount = models.BigIntegerField(default=0)

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        validators=[MinValueValidator(Decimal("-90")), MaxValueValidator(Decimal("90"))],
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        validators=[MinValueValidator(Decimal("-180")), MaxValueValidator(Decimal("180"))],
    )
    address = models.CharField(max_length=255, blank=True, default="")
    accuracy_m = models.FloatField(null=True, blank=True)

    client_uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    reviewed_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_reports"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def primary_image(self):
        return self.images.first()

    @staticmethod
    def recent_duplicate(user, latitude, longitude, minutes=60):
        """Duplicate guard: same user, ~55m radius, last N minutes."""
        from datetime import timedelta

        cutoff = timezone.now() - timedelta(minutes=minutes)
        return WasteReport.objects.filter(
            user=user,
            latitude__range=(float(latitude) - 0.0005, float(latitude) + 0.0005),
            longitude__range=(float(longitude) - 0.0005, float(longitude) + 0.0005),
            created_at__gte=cutoff,
        ).exists()


class WasteImage(models.Model):
    class Meta:
        db_table = "reports_waste_image"
        ordering = ["created_at"]

    report = models.ForeignKey(WasteReport, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="reports/%Y/%m/%d/")
    created_at = models.DateTimeField(auto_now_add=True)


class Location(models.Model):
    """Optional richer geodata attached to a report (reserved for future geofencing)."""

    class Meta:
        db_table = "reports_location"

    report = models.OneToOneField(WasteReport, on_delete=models.CASCADE, related_name="location")
    country = models.CharField(max_length=64, blank=True, default="")
    region = models.CharField(max_length=128, blank=True, default="")
    raw = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)