from django.urls import path

from apps.bot.views import BotConfigView, BotWebhookView

urlpatterns = [
    path("config/", BotConfigView.as_view(), name="bot-config"),
    path("webhook/", BotWebhookView.as_view(), name="bot-webhook"),
]