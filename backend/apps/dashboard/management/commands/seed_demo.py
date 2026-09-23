"""Demo data seeder: creates a staff admin, a demo user, a couple of reports
and transactions so the platform is instantly explorable.

Usage:  python manage.py seed_demo
"""

import os

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.reports.models import WasteReport
from apps.reports.services import approve_report, reject_report
from apps.transactions.serializers import apply_adjustment
from apps.users.models import Profile, User


class Command(BaseCommand):
    help = "Demo ma'lumotlarni yaratadi (admin + foydalanuvchi + arizalar)."

    @transaction.atomic
    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            phone="+998900000000",
            defaults={
                "first_name": "Admin",
                "last_name": "EcoQadam",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if not admin.password or admin.password.startswith("!"):
            admin.set_password("admin123")
            admin.save()

        user, created = User.objects.get_or_create(
            phone="+998901234567",
            defaults={"first_name": "Aziz", "last_name": "Karimov"},
        )
        if created:
            user.set_password("user1234")
            user.save()
        Profile.objects.get_or_create(user=user, defaults={"notifications_enabled": True})

        self.stdout.write(f"Admin: +998900000000 / admin123")
        self.stdout.write(f"User:  +998901234567 / user1234")

        sample_points = [
            (41.311081, 69.240562, "Mirzo Ulug'bek tumani"),
            (41.323619, 69.22808, "Chilonzor tumani"),
            (41.315891, 69.27998, "Yunusobod tumani"),
        ]

        created_any = False
        for lat, lng, addr in sample_points:
            if WasteReport.objects.filter(user=user, latitude=lat, longitude=lng).exists():
                continue
            report = WasteReport.objects.create(
                user=user,
                waste_type="other",
                description=f"Namuna ariza — {addr} da tashlab ketilgan chiqindi.",
                latitude=lat,
                longitude=lng,
                address=addr,
                accuracy_m=12,
            )
            created_any = True
            if report.pk % 3 == 1:
                reject_report(report, admin, reason="Namuna: joy tashlab ketilgan chiqindi aniq emas")
            elif report.pk % 3 == 2:
                approve_report(report, admin, amount=10000 + report.pk * 1000)
            # report #3 stays PENDING

        if not created_any:
            self.stdout.write("Namuna arizalar allaqachon mavjud.")

        user.balance = 0
        user.save(update_fields=["balance"])
        # restore authoritative balance from ledger
        from apps.transactions.models import Transaction

        user.balance = Transaction.ledger_balance(user)
        user.save(update_fields=["balance"])

        self.stdout.write(self.style.SUCCESS("Done."))