from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.serializers import (
    ChangeProfileSerializer,
    ProfileSerializer,
    RegisterSerializer,
    TelegramVerifySerializer,
    UserSerializer,
)
from apps.users.services import consume_telegram_login_token

User = get_user_model()


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": UserSerializer(user, context={"request": None}).data,
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response(_tokens_for(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        phone = request.data.get("phone", "").strip()
        if phone and not phone.startswith("+"):
            phone = "+" + phone.lstrip("0")
        user = authenticate(request, username=phone, password=request.data.get("password", ""))
        if user is None:
            return Response(
                {"detail": "Telefon raqam yoki parol noto'g'ri."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(_tokens_for(user))


class TelegramVerifyView(APIView):
    """Frontend receives ?token=... from the bot link and exchanges for JWT."""

    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        ser = TelegramVerifySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user_id = consume_telegram_login_token(ser.validated_data["token"])
        if user_id is None:
            return Response(
                {"detail": "Token yaroqsiz yoki muddati tugagan."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.get(pk=user_id)
        return Response(_tokens_for(user))


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user.profile, context={"request": request}).data)

    def patch(self, request):
        profile = request.user.profile
        ser = ChangeProfileSerializer(profile, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ProfileSerializer(profile, context={"request": request}).data)