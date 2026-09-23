"""Audit helper for the custom admin dashboard."""

from apps.rewards.models import AdminActionLog
from apps.users.models import User


def audit(admin: User, action: str, target_type: str, target_id, details: dict | None = None) -> None:
    AdminActionLog.objects.create(
        admin=admin,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details or {},
    )