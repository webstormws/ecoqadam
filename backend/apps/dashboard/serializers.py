from rest_framework import serializers

from apps.reports.models import WasteReport
from apps.users.models import User
from apps.withdrawals.models import WithdrawalRequest


class ApproveReportSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1)


class RejectReportSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class AdminReportSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    waste_type_display = serializers.CharField(source="get_waste_type_display", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = WasteReport
        fields = [
            "id", "user_phone", "user_name", "waste_type", "waste_type_display",
            "description", "status", "status_display", "reward_amount",
            "latitude", "longitude", "address", "accuracy_m", "image",
            "client_uid", "reviewed_by", "reviewed_at", "created_at",
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.phone

    def get_image(self, obj):
        req = self.context.get("request")
        img = obj.primary_image
        return req.build_absolute_uri(img.image.url) if (img and req) else None


class AdminWithdrawalSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = WithdrawalRequest
        fields = [
            "id", "user_phone", "user_name", "amount", "card_number", "masked_card",
            "status", "status_display", "note", "processed_by", "processed_at",
            "created_at", "updated_at",
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.phone


class AdminWithdrawalActionSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True, default="")
    amount = serializers.IntegerField(required=False, help_text="Optional override amount")


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    report_stats = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "phone", "full_name", "email", "avatar", "telegram_id",
            "telegram_username", "balance", "is_active", "is_staff", "date_joined",
            "report_stats",
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.phone

    def get_report_stats(self, obj):
        return {
            "total": obj.reports.count(),
            "approved": obj.reports.filter(status=WasteReport.Status.APPROVED).count(),
        }