from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

from apps.users.models import Profile  # noqa: E402


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "phone", "email", "first_name", "last_name", "full_name",
            "avatar_url", "telegram_id", "telegram_username", "balance",
            "is_staff", "is_active", "date_joined",
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.phone

    def get_avatar_url(self, obj):
        req = self.context.get("request")
        if obj.avatar and req:
            return req.build_absolute_uri(obj.avatar.url)
        return None


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "notifications_enabled", "language", "registered_at"]


class RegisterSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=16)
    first_name = serializers.CharField(max_length=64)
    last_name = serializers.CharField(max_length=64, required=False, allow_blank=True, default="")
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_phone(self, value):
        from apps.users.services import normalize_phone

        value = normalize_phone(value)
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Bu telefon raqam allaqachon ro'yxatdan o'tgan.")
        return value

    def create(self, validated):
        user = User.objects.create_user(
            phone=validated["phone"],
            first_name=validated["first_name"],
            last_name=validated.get("last_name", ""),
            password=validated["password"],
        )
        Profile.objects.get_or_create(user=user, defaults={"notifications_enabled": True})
        return user


class TelegramVerifySerializer(serializers.Serializer):
    """Exchange a bot-issued login token for JWT tokens."""

    token = serializers.CharField()


class ChangeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["notifications_enabled", "language"]