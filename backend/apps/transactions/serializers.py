from django.db import transaction
from rest_framework import serializers

from apps.transactions.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source="get_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "amount", "type", "type_display", "status", "status_display",
            "reference", "note", "created_at",
        ]


class AdminAdjustBalanceSerializer(serializers.Serializer):
    amount = serializers.IntegerField(help_text="Signed amount: +30 000 or -10 000")
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")


@transaction.atomic
def apply_adjustment(user, admin, amount: int, reason: str = "") -> Transaction:
    """Admin manual balance adjustment. Always audited."""
    tx = Transaction.objects.create(
        user=user,
        amount=amount,
        type=Transaction.Type.ADJUSTMENT,
        status=Transaction.Status.COMPLETED,
        created_by=admin,
        note=reason or "Admin balansni tuzatdi",
    )
    user.balance = Transaction.ledger_balance(user)
    user.save(update_fields=["balance"])
    return tx