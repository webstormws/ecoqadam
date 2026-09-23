"""Withdrawal lifecycle. Payments are manual (admin Mark as Paid) for now;
a Click/Payme/Uzcard/Humo integration can replace the PAID step later."""

from django.conf import settings
from django.db import transaction as db_transaction
from django.utils import timezone

from apps.notifications.services import notify_withdrawal
from apps.transactions.models import Transaction
from apps.withdrawals.models import WithdrawalRequest


def _has_active_request(user) -> bool:
    return WithdrawalRequest.objects.filter(
        user=user, status__in=[WithdrawalRequest.Status.PENDING, WithdrawalRequest.Status.APPROVED]
    ).exists()


def validate_request(user, amount: int, card_number: str) -> None:
    if amount < settings.MIN_WITHDRAWAL_AMOUNT:
        raise ValueError(f"Minimal yechib olish summasi {settings.MIN_WITHDRAWAL_AMOUNT:,} so'm.".replace(",", " "))
    if amount > user.balance:
        raise ValueError("Balansda yetarli mablag' yo'q.")
    digits = card_number.replace(" ", "").replace("-", "")
    if not (digits.isdigit() and 8 <= len(digits) <= 19):
        raise ValueError("Karta raqami noto'g'ri formatda.")
    if _has_active_request(user):
        raise ValueError("Sizda allaqachon ko'rib chiqilayotgan ariza mavjud.")


@db_transaction.atomic
def create_withdrawal(user, amount: int, card_number: str) -> WithdrawalRequest:
    validate_request(user, amount, card_number)
    request = WithdrawalRequest.objects.create(
        user=user, amount=amount, card_number=card_number.replace(" ", "")
    )
    # Freeze funds on ledger so balance reflects pending liability
    Transaction.objects.create(
        user=user,
        amount=-amount,
        type=Transaction.Type.WITHDRAWAL,
        status=Transaction.Status.PENDING,
        reference=f"withdrawal:{request.pk}",
        note="Pul yechish arizasi",
    )
    user.balance = Transaction.ledger_balance(user)
    user.save(update_fields=["balance"])
    notify_withdrawal(request)
    return request


@db_transaction.atomic
def approve_withdrawal(request: WithdrawalRequest, admin) -> WithdrawalRequest:
    if request.status != WithdrawalRequest.Status.PENDING:
        raise ValueError("Faqat PENDING arizani tasdiqlash mumkin.")
    request.status = WithdrawalRequest.Status.APPROVED
    request.processed_by = admin
    request.processed_at = timezone.now()
    request.save()
    notify_withdrawal(request)
    return request


@db_transaction.atomic
def mark_withdrawal_paid(request: WithdrawalRequest, admin) -> WithdrawalRequest:
    if request.status not in (WithdrawalRequest.Status.APPROVED, WithdrawalRequest.Status.PENDING):
        raise ValueError("To'lovni faqat APPROVED yoki PENDING arizaga belgilash mumkin.")
    request.status = WithdrawalRequest.Status.PAID
    request.processed_by = admin
    request.processed_at = timezone.now()
    request.save()

    # Settle the earlier PENDING withdrawal ledger entry
    Transaction.objects.filter(
        user=request.user,
        type=Transaction.Type.WITHDRAWAL,
        status=Transaction.Status.PENDING,
        reference=f"withdrawal:{request.pk}",
    ).update(status=Transaction.Status.COMPLETED)

    request.user.balance = Transaction.ledger_balance(request.user)
    request.user.save(update_fields=["balance"])
    notify_withdrawal(request)
    return request


@db_transaction.atomic
def reject_withdrawal(request: WithdrawalRequest, admin, note: str = "") -> WithdrawalRequest:
    if request.status != WithdrawalRequest.Status.PENDING:
        raise ValueError("Faqat PENDING arizani rad etish mumkin.")
    request.status = WithdrawalRequest.Status.REJECTED
    request.note = note
    request.processed_by = admin
    request.processed_at = timezone.now()
    request.save()

    # Release frozen funds back
    Transaction.objects.filter(
        user=request.user,
        type=Transaction.Type.WITHDRAWAL,
        status=Transaction.Status.PENDING,
        reference=f"withdrawal:{request.pk}",
    ).update(
        status=Transaction.Status.FAILED,
        note="Pul yechish arizasi rad etildi — mablag' qaytarildi",
    )
    Transaction.objects.create(
        user=request.user,
        amount=request.amount,
        type=Transaction.Type.REFUND,
        status=Transaction.Status.COMPLETED,
        reference=f"withdrawal:{request.pk}:refund",
        note="Rad etilgan pul yechish arizasi uchun qaytarildi",
    )
    request.user.balance = Transaction.ledger_balance(request.user)
    request.user.save(update_fields=["balance"])
    notify_withdrawal(request)
    return request