"""Shared helpers across apps: one-off tokens, Telegram text helpers, etc."""

import secrets

from django.conf import settings
from django.core.cache import cache


def normalize_phone(value: str) -> str:
    """Bo'sh joy, tire, qavs va boshqa belgilarni olib tashlab, + bilan birlashtiradi."""
    if not value:
        return value
    value = str(value).strip()
    digits = "".join(ch for ch in value if ch.isdigit())
    if not digits:
        return value
    return "+" + digits.lstrip("0")


def issue_telegram_login_token(user) -> str:
    """Short-lived token that lets the frontend exchange for JWT after a bot login."""
    token = secrets.token_urlsafe(32)
    cache.set(f"tg_auth:{token}", user.pk, timeout=10 * 60)
    return token


def consume_telegram_login_token(token) -> int | None:
    key = f"tg_auth:{token}"
    user_id = cache.get(key)
    if user_id is not None:
        cache.delete(key)
    return user_id


def bot_auth_url(token: str) -> str:
    url = f"{settings.APP_BASE_URL}/auth/telegram?token={token}"
    return url