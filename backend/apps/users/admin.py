from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.users.models import Profile, User


@admin.register(User)
class EcoUserAdmin(UserAdmin):
    list_display = ("phone", "first_name", "last_name", "telegram_id", "balance", "is_active")
    search_fields = ("phone", "first_name", "last_name", "telegram_username")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email", "avatar")}),
        ("Telegram", {"fields": ("telegram_id", "telegram_username")}),
        ("Wallet", {"fields": ("balance",)}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("phone", "password1", "password2", "first_name", "last_name")}),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "notifications_enabled", "language", "registered_at")
    search_fields = ("user__phone",)