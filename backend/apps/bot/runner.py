"""Long-polling Telegram bot runner (for local/dev). For production you may
switch to webhook + a worker, but the handlers stay the same."""

import logging
import time

from django.conf import settings

from apps.bot.handlers import handle_update
from apps.bot.utils import telegram_request

logger = logging.getLogger(__name__)


def run_forever(once: bool = False):
    if not settings.TELEGRAM_BOT_TOKEN:
        print("TELEGRAM_BOT_TOKEN kiritilmagan. .env faylini tekshiring.")
        return

    print(f"Eco Qadam bot ishga tushdi (@{settings.TELEGRAM_BOT_USERNAME}). Ctrl+C to stop.")
    offset = None
    try:
        while True:
            updates = telegram_request("getUpdates", offset=offset, timeout=25) or []
            for update in updates:
                try:
                    handle_update(update)
                except Exception:
                    logger.exception("Failed to process update %s", update.get("update_id"))
                offset = update.get("update_id") + 1
            if once:
                break
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nBot to'xtatildi.")