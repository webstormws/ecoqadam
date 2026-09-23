"""Report lifecycle services. All financial mutations happen here inside
database transactions so balance, ledger and rewards stay consistent."""

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from apps.notifications.services import notify_reward, notify_report_status
from apps.reports.models import WasteReport
from apps.rewards.models import Reward
from apps.transactions.models import Transaction


@transaction.atomic
def approve_report(report: WasteReport, admin, amount: int) -> WasteReport:
    if report.status != WasteReport.Status.PENDING:
        raise ValueError("Faqat PENDING holatdagi arizani tasdiqlash mumkin.")
    if not (0 < amount <= settings.MAX_REWARD_AMOUNT):
        raise ValueError("Mukofot miqdori noto'g'ri.")

    # Guard against double approval (row lock)
    locked = WasteReport.objects.select_for_update().get(pk=report.pk)
    if locked.status != WasteReport.Status.PENDING:
        raise ValueError("Ariza allaqachon ko'rib chiqilgan.")

    locked.status = WasteReport.Status.APPROVED
    locked.reward_amount = amount
    locked.reviewed_by = admin
    locked.reviewed_at = timezone.now()
    locked.save()

    Reward.objects.create(report=locked, user=locked.user, amount=amount)

    Transaction.objects.create(
        user=locked.user,
        amount=amount,
        type=Transaction.Type.REWARD,
        status=Transaction.Status.COMPLETED,
        reference=f"report:{locked.pk}",
        note=f"Chiqindi tasdiqlandi — {locked.get_waste_type_display()}",
    )

    locked.user.balance = Transaction.ledger_balance(locked.user)
    locked.user.save(update_fields=["balance"])

    notify_report_status(locked)
    notify_reward(locked, amount)
    return locked


@transaction.atomic
def reject_report(report: WasteReport, admin, reason: str = "") -> WasteReport:
    if report.status != WasteReport.Status.PENDING:
        raise ValueError("Faqat PENDING holatdagi arizani rad etish mumkin.")

    report.status = WasteReport.Status.REJECTED
    report.reviewed_by = admin
    report.reviewed_at = timezone.now()
    report.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

    notify_report_status(report, reason=reason)
    return report