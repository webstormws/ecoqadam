from django.db import models

from apps.users.models import User


class WithdrawalRequest(models.Model):
    class Meta:
        db_table = "withdrawals_withdrawal_request"
        ordering = ["-created_at"]

    class Status(models.TextChoices):
        PENDING = "PENDING", "Kutilmoqda"
        APPROVED = "APPROVED", "Tasdiqlandi"
        PAID = "PAID", "To'landi"
        REJECTED = "REJECTED", "Rad etildi"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="withdrawal_requests")
    amount = models.BigIntegerField()
    card_number = models.CharField(max_length=19)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    note = models.CharField(max_length=255, blank=True, default="")
    processed_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="processed_withdrawals"
    )
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def masked_card(self):
        value = self.card_number.replace(" ", "")
        return f"{value[:4]} **** **** {value[-4:]}" if len(value) >= 8 else "****"

    def __str__(self):
        return f"W{self.pk} {self.user_id} -{self.amount}"