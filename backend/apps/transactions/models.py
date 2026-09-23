from django.db import models

from apps.users.models import User


class TransactionQuerySet(models.QuerySet):
    def completed(self):
        return self.filter(status=Transaction.Status.COMPLETED)

    def balance(self):
        return self.completed().aggregate(total=models.Sum("amount"))["total"] or 0


class Transaction(models.Model):
    class Meta:
        db_table = "transactions_transaction"
        ordering = ["-created_at"]

    class Type(models.TextChoices):
        REWARD = "REWARD", "Mukofot"
        WITHDRAWAL = "WITHDRAWAL", "Pul yechish"
        REFUND = "REFUND", "Qaytarish"
        ADJUSTMENT = "ADJUSTMENT", "Balansni tuzatish"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Kutilmoqda"
        COMPLETED = "COMPLETED", "Bajarildi"
        FAILED = "FAILED", "Muvaffaqiyatsiz"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    amount = models.BigIntegerField(help_text="Signed: positive = income, negative = expense")
    type = models.CharField(max_length=16, choices=Type.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.COMPLETED)
    reference = models.CharField(max_length=64, blank=True, default="")
    note = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_transactions"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    objects = TransactionQuerySet.as_manager()

    @staticmethod
    def ledger_balance(user: User) -> int:
        """Authoritative balance = sum of completed transactions."""
        return Transaction.objects.filter(user=user, status=Transaction.Status.COMPLETED).aggregate(
            total=models.Sum("amount")
        )["total"] or 0

    def __str__(self):
        return f"{self.type} {self.amount} ({self.user_id})"