from django.db import models

from apps.users.models import User


class Notification(models.Model):
    class Meta:
        db_table = "notifications_notification"
        ordering = ["-created_at"]

    class Type(models.TextChoices):
        REPORT = "report", "Ariza"
        REWARD = "reward", "Mukofot"
        WITHDRAWAL = "withdrawal", "Pul yechish"
        SYSTEM = "system", "Tizim"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=16, choices=Type.choices, default=Type.SYSTEM)
    title = models.CharField(max_length=128)
    body = models.TextField(blank=True, default="")
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id} {self.title}"