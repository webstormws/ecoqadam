import uuid

from django.utils import timezone
from rest_framework import serializers

from apps.reports.models import WasteImage, WasteReport
from apps.reports.validators import validate_report_image


class ReportListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    waste_type_display = serializers.CharField(source="get_waste_type_display", read_only=True)
    image = serializers.SerializerMethodField()
    reward_label = serializers.SerializerMethodField()

    class Meta:
        model = WasteReport
        fields = [
            "id", "status", "status_display", "waste_type", "waste_type_display",
            "description", "reward_amount", "reward_label", "image",
            "latitude", "longitude", "address", "created_at",
        ]

    def get_image(self, obj):
        req = self.context.get("request")
        img = obj.primary_image
        if img and req:
            return req.build_absolute_uri(img.image.url)
        return None

    def get_reward_label(self, obj):
        if obj.status == WasteReport.Status.APPROVED and obj.reward_amount:
            return f"+ {obj.reward_amount:,} so'm".replace(",", " ")
        return None


class ReportDetailSerializer(ReportListSerializer):
    images = serializers.SerializerMethodField()
    accuracy_m = serializers.FloatField(read_only=True)
    client_uid = serializers.UUIDField(read_only=True)

    class Meta(ReportListSerializer.Meta):
        fields = ReportListSerializer.Meta.fields + [
            "images", "accuracy_m", "client_uid", "reviewed_at", "updated_at",
        ]

    def get_images(self, obj):
        req = self.context.get("request")
        return [
            req.build_absolute_uri(img.image.url) if req and img.image else None
            for img in obj.images.all()
        ]


class ReportCreateSerializer(serializers.Serializer):
    image = serializers.ImageField(validators=[validate_report_image])
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7)
    accuracy_m = serializers.FloatField(required=False, allow_null=True, min_value=0, max_value=5000)
    description = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    waste_type = serializers.ChoiceField(choices=WasteReport.WasteType.choices, default="other")
    client_uid = serializers.UUIDField(required=False)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255)

    def validate_latitude(self, value):
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude -90..90 oralig'ida bo'lishi kerak.")
        return value

    def validate_longitude(self, value):
        if not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude -180..180 oralig'ida bo'lishi kerak.")
        return value

    def validate(self, attrs):
        attrs.setdefault("client_uid", uuid.uuid4())
        if WasteReport.objects.filter(client_uid=attrs["client_uid"]).exists():
            raise serializers.ValidationError({"client_uid": "Bu ariza allaqachon yuborilgan."})
        user = self.context["request"].user
        if WasteReport.recent_duplicate(
            user, attrs["latitude"], attrs["longitude"], minutes=3
        ):
            raise serializers.ValidationError(
                "Siz bu joydan yaqinda ariza yuborgansiz. Takroriy arizalar qabul qilinmaydi."
            )
        return attrs

    def create(self, validated):
        user = self.context["request"].user
        image = validated.pop("image")
        report = WasteReport.objects.create(
            user=user,
            **validated,
        )
        WasteImage.objects.create(report=report, image=image)
        return report