from django.db import connection
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bot.utils import telegram_request


class HealthView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        db = {"ok": True, "error": None}
        try:
            connection.ensure_connection()
        except Exception as exc:  # noqa: BLE001
            db = {"ok": False, "error": str(exc)}
        return Response({"status": "ok", "database": db})


class BotConfigView(APIView):
    """Public-ish: lets the frontend build the 'login via Telegram' deep link."""

    permission_classes = []
    authentication_classes = []

    def get(self, request):
        from django.conf import settings

        return Response(
            {
                "bot_username": settings.TELEGRAM_BOT_USERNAME,
                "app_base_url": settings.APP_BASE_URL,
                "auth_path": "/auth/telegram",
            }
        )


class BotWebhookView(APIView):
    """Optional webhook entry point (alternative to polling runner)."""

    permission_classes = []
    authentication_classes = []

    def post(self, request):
        from apps.bot.handlers import handle_update

        handle_update(request.data)
        return Response({"ok": True})