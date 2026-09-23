"""Notification service: persists in-app notifications and relays the same
message to Telegram (if the user is linked)."""

from apps.bot.utils import send_telegram_message
from apps.notifications.models import Notification


def _notify(user, ntype, title, body="", data=None):
    Notification.objects.create(
        user=user, type=ntype, title=title, body=body, data=data or {}
    )
    if user.telegram_id:
        send_telegram_message(user.telegram_id, f"{title}\n{body}".strip())


def notify_report_created(report):
    _notify(
        report.user,
        Notification.Type.REPORT,
        "Arizangiz qabul qilindi.",
        "Arizangiz admin tomonidan ko'rib chiqilmoqda.",
        {"report_id": report.id},
    )


def notify_report_status(report, reason=""):
    if report.status == report.Status.APPROVED:
        _notify(
            report.user,
            Notification.Type.REPORT,
            "Tabriklaymiz! Siz yuborgan chiqindi tasdiqlandi.",
            f"Mukofot: {report.reward_amount:,} so'm".replace(",", " "),
            {"report_id": report.id},
        )
    elif report.status == report.Status.REJECTED:
        extra = f" Sabab: {reason}" if reason else ""
        _notify(
            report.user,
            Notification.Type.REPORT,
            "Arizangiz rad etildi.",
            f"Afsonki, bu ariza tasdiqlanmadi.{extra}",
            {"report_id": report.id},
        )


def notify_reward(report, amount):
    _notify(
        report.user,
        Notification.Type.REWARD,
        f"Hisobingizga {amount:,} so'm qo'shildi.".replace(",", " "),
        "Chiqindi haqidagi xabaringiz uchun rahmat!",
        {"report_id": report.id, "amount": amount},
    )


def notify_withdrawal(request):
    text = {
        request.Status.PENDING: (
            "Pul yechish so'rovingiz qabul qilindi.",
            f"Summa: {request.amount:,} so'm".replace(",", " "),
        ),
        request.Status.APPROVED: (
            "Pul yechish so'rovingiz tasdiqlandi.",
            "To'lov amalga oshirish uchun navbatda.",
        ),
        request.Status.PAID: (
            "Pul to'lovi amalga oshirildi.",
            f"{request.amount:,} so'm karta hisobingizga o'tkazildi.".replace(",", " "),
        ),
        request.Status.REJECTED: (
            "Pul yechish so'rovingiz rad etildi.",
            request.note or "Mablag' balansingizga qaytarildi.",
        ),
    }
    title, body = text[request.status]
    _notify(request.user, Notification.Type.WITHDRAWAL, title, body, {"withdrawal_id": request.id})