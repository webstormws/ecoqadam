from django.db import models

from apps.reports.models import WasteReport
from apps.users.models import User


class Reward(models.Model):
    class Meta:
        db_table = "rewards_reward"
        unique_together = [("report", "user")]
        ordering = ["-created_at"]

    report = models.OneToOneField(WasteReport, on_delete=models.CASCADE, related_name="reward")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rewards")
    amount = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id} +{self.amount} (report {self.report_id})"


class AdminActionLog(models.Model):
    """Audit trail for every admin action that touches money or statuses."""

    class Meta:
        db_table = "rewards_admin_action_log"
        ordering = ["-created_at"]

    action_choices = [
        ("approve_report", "Arizani tasdiqlash"),
        ("reject_report", "Arizani rad etish"),
        ("withdrawal_approve", "Yechib olishni tasdiqlash"),
        ("withdrawal_reject", "Yechib olishni rad etish"),
        ("withdrawal_paid", "To'lovni belgilash"),
        ("adjust_balance", "Balansni tuzatish"),
        ("user_update", "Foydalanuvchini tahrirlash"),
    ]

    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name="admin_actions")
    action = models.CharField(max_length=32, choices=action_choices)
    target_type = models.CharField(max_length=32)
    target_id = models.PositiveBigIntegerField()
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admin_id} {self.action} -> {self.target_type}:{self.target_id}"