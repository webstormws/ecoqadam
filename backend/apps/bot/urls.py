from django.urls import path

from apps.bot.views import BotConfigView, BotWebhookView, HealthView

urlpatterns = [
    path("config/", BotConfigView.as_view(), name="bot-config"),
    path("health/", HealthView.as_view(), name="health"),
    path("webhook/", BotWebhookView.as_view(), name="bot-webhook"),
]