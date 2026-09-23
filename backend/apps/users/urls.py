from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import LoginView, MeView, RegisterView, TelegramVerifyView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("telegram/verify/", TelegramVerifyView.as_view(), name="auth-telegram-verify"),
    path("me/", MeView.as_view(), name="auth-me"),
]