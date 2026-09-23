from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models

PHONE_VALIDATOR = RegexValidator(
    regex=r"^\+?[0-9]{9,15}$",
    message="Telefon raqami noto'g'ri formatda. Masalan: +998901234567",
)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, phone, password, **extra_fields):
        if not phone:
            raise ValueError("Telefon raqami kiritilishi shart.")
        from apps.users.services import normalize_phone

        phone = normalize_phone(phone)
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, password, **extra_fields)

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser is_staff=True bo'lishi kerak.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser is_superuser=True bo'lishi kerak.")
        return self._create_user(phone, password, **extra_fields)


class User(AbstractUser):
    """Eco Qadam user. Phone is the primary login identifier."""

    class Meta:
        db_table = "users_user"

    username = None
    phone = models.CharField(
        "telefon raqami", max_length=16, unique=True, validators=[PHONE_VALIDATOR]
    )
    email = models.EmailField("email", blank=True, null=True, unique=True)
    avatar = models.ImageField("avatar", upload_to="avatars/", blank=True, null=True)
    telegram_id = models.BigIntegerField("telegram id", null=True, blank=True, unique=True)
    telegram_username = models.CharField(max_length=64, blank=True, default="")
    balance = models.BigIntegerField("joriy balans", default=0)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    def __str__(self):
        return f"{self.get_full_name() or self.phone} ({self.phone})"


class Profile(models.Model):
    class Meta:
        db_table = "users_profile"

    LANGUAGE_CHOICES = (("uz", "O'zbekcha"), ("ru", "Русский"), ("en", "English"))

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    notifications_enabled = models.BooleanField(default=True)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default="uz")
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile: {self.user.phone}"