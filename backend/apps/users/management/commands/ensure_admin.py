from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.users.models import Profile
from apps.users.services import normalize_phone

User = get_user_model()


class Command(BaseCommand):
    help = "ADMIN_PHONE / ADMIN_PASSWORD env o'zgaruvchilaridan staff admin yaratadi."

    def handle(self, *args, **options):
        import os

        phone = os.getenv("ADMIN_PHONE", "").strip()
        password = os.getenv("ADMIN_PASSWORD", "").strip()
        name = os.getenv("ADMIN_NAME", "Admin").strip()
        if not phone:
            self.stdout.write(self.style.WARNING("ADMIN_PHONE o'rnatilmagan — admin yaratilmadi."))
            return
        phone = normalize_phone(phone)
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={"first_name": name, "is_staff": True, "is_superuser": True},
        )
        user.is_staff = True
        user.is_superuser = True
        if created and not password:
            raise SystemExit(
                "ADMIN_PASSWORD o'rnatilmagan, lekin administrator yangi — parol majburiy."
            )
        if password:
            user.set_password(password)
            user.first_name = name
        user.save()
        Profile.objects.get_or_create(user=user)
        verb = "yaratildi" if created else "yangilandi"
        self.stdout.write(self.style.SUCCESS(f"Admin ({phone}) {verb}."))