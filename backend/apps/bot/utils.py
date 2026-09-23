"""Thin Telegram Bot API client (requests based). Used by the polling bot
and by the notification relay."""

import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

TG_API = "https://api.telegram.org"


def token() -> str:
    return settings.TELEGRAM_BOT_TOKEN


def telegram_request(method: str, **params) -> dict | None:
    if not token():
        logger.warning("TELEGRAM_BOT_TOKEN not configured, skipping request %s", method)
        return None
    url = f"{TG_API}/bot{token()}/{method}"
    try:
        resp = requests.post(url, json=params, timeout=15)
        data = resp.json()
        if not data.get("ok"):
            logger.warning("Telegram %s error: %s", method, data)
            return None
        return data["result"]
    except requests.RequestException as exc:
        logger.error("Telegram request %s failed: %s", method, exc)
        return None


def send_telegram_message(chat_id, text: str, inline_keyboard=None) -> None:
    params = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if inline_keyboard:
        params["reply_markup"] = {"inline_keyboard": inline_keyboard}
    telegram_request("sendMessage", **params)


def set_webhook(url: str):
    return telegram_request("setWebhook", url=url, drop_pending_updates=True)


def delete_webhook():
    return telegram_request("deleteWebhook")