"""Telegram bot conversation handlers.

Flow:  START → share phone → full name → account created → login link for the app.
Account state is kept per chat in Django cache.
"""

import logging
import random
import string

from django.conf import settings
from django.core.cache import cache

from apps.bot.utils import send_telegram_message
from apps.users.models import Profile, User
from apps.users.services import bot_auth_url, issue_telegram_login_token

logger = logging.getLogger(__name__)

STATE_PHONE = "await_phone"
STATE_NAME = "await_name"


def _state_key(chat_id):
    return f"tg_state:{chat_id}"


def _data_key(chat_id):
    return f"tg_data:{chat_id}"


def _get_or_create_user(chat_id, phone, first_name, last_name):
    tg_id = int(chat_id)
    username = ""  # set from update where available

    user = User.objects.filter(telegram_id=tg_id).first()
    if user is None:
        user = User.objects.filter(phone=phone).first()

    created = user is None
    if created:
        password = "".join(random.choices(string.ascii_letters + string.digits, k=16))
        user = User.objects.create_user(
            phone=phone,
            first_name=first_name,
            last_name=last_name,
            password=password,
            telegram_id=tg_id,
        )
    else:
        user.telegram_id = tg_id
        user.save(update_fields=["telegram_id", "updated_at"])

    Profile.objects.get_or_create(user=user)
    return user, created


def _login_token(user):
    return issue_telegram_login_token(user)


def handle_update(update: dict) -> None:
    message = update.get("message") or update.get("edited_message")
    if not message:
        return
    chat = message.get("chat", {})
    chat_id = chat.get("id")
    from_ = message.get("from", {})
    text = (message.get("text") or "").strip()

    if not chat_id:
        return

    state = cache.get(_state_key(chat_id))
    contact = message.get("contact")

    if text == "/start" or (text and text.lower().startswith("/start")):
        _start(chat_id)
        return

    if contact and state == STATE_PHONE:
        phone = contact.get("phone_number", "")
        if not phone.startswith("+"):
            phone = "+" + phone
        data = {
            "phone": phone,
            "first_name": contact.get("first_name") or from_.get("first_name", ""),
            "last_name": contact.get("last_name") or from_.get("last_name", ""),
        }
        cache.set(_data_key(chat_id), data, timeout=1800)
        cache.set(_state_key(chat_id), STATE_NAME, timeout=1800)
        ask_name(chat_id)
        return

    if text and state == STATE_NAME:
        data = cache.get(_data_key(chat_id)) or {
            "phone": "",
            "first_name": from_.get("first_name", ""),
            "last_name": from_.get("last_name", ""),
        }
        parts = text.split(" ", 1)
        data["first_name"] = parts[0] or data.get("first_name", "")
        data["last_name"] = parts[1] if len(parts) > 1 else data.get("last_name", "")
        data["first_name"] = data["first_name"] or from_.get("first_name", "")
        cache.set(_data_key(chat_id), data, timeout=1800)
        _finish_registration(chat_id, data)
        return

    # default warm-up message
    send_telegram_message(
        chat_id,
        "Assalomu alaykum! Eco Qadam botiga xush kelibsiz.\n"
        "Chiqindi haqida xabar berib pul ishlang.\n\n"
        "Kirish uchun pastdagi tugmani bosing: /start",
    )


def _start(chat_id):
    markup = [
        [
            {
                "text": "📱 Telefon raqamini yuborish",
                "request_contact": True,
            }
        ]
    ]
    send_telegram_message(
        chat_id,
        "Eco Qadam!\n\n"
        "Davom etish uchun telefon raqamingizni yuboring 👇",
        inline_keyboard=markup,
    )
    cache.set(_state_key(chat_id), STATE_PHONE, timeout=1800)


def ask_name(chat_id):
    send_telegram_message(
        chat_id,
        "Ismingiz va familiyangizni yozing.\nMasalan: Aziz Karimov",
    )


def _finish_registration(chat_id, data):
    phone = data.get("phone", "")
    if not phone:
        send_telegram_message(chat_id, "Telefon raqam topilmadi. /start ni bosing.")
        return

    user, created = _get_or_create_user(
        chat_id,
        phone,
        data.get("first_name", "Foydalanuvchi"),
        data.get("last_name", ""),
    )

    if created:
        msg = "Hisobingiz muvaffaqiyatli yaratildi ✅"
    else:
        msg = "Hisobingiz topildi ✅"
    msg += "\n\nIlovaga kirish uchun quyidagi tugmani bosing:"

    token = _login_token(user)
    markup = [[{"text": "🔗 Eco Qadam ilovasiga kirish", "url": bot_auth_url(token)}]]
    send_telegram_message(chat_id, msg, inline_keyboard=markup)

    cache.delete(_state_key(chat_id))
    cache.delete(_data_key(chat_id))

    logger.info("Telegram onboarded user id=%s chat_id=%s", user.id, chat_id)