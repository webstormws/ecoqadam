from rest_framework import serializers

from apps.withdrawals.models import WithdrawalRequest


class WithdrawalSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    masked_card = serializers.CharField(read_only=True)

    class Meta:
        model = WithdrawalRequest
        fields = [
            "id", "amount", "masked_card", "status", "status_display",
            "note", "created_at",
        ]
        read_only_fields = fields


class WithdrawalCreateSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1)
    card_number = serializers.CharField(max_length=19)  # e.g. 8600 1234 5678 9012


class AdminWithdrawalSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = WithdrawalRequest
        fields = [
            "id", "user", "user_phone", "amount", "card_number", "masked_card",
            "status", "status_display", "note", "processed_by", "processed_at",
            "created_at", "updated_at",
        ]
        read_only_fields = fields