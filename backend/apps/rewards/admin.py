from django.contrib import admin

from apps.rewards.models import AdminActionLog, Reward


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ("report", "user", "amount", "created_at")
    search_fields = ("user__phone",)
    list_select_related = ("user", "report")


@admin.register(AdminActionLog)
class AdminActionLogAdmin(admin.ModelAdmin):
    list_display = ("admin", "action", "target_type", "target_id", "created_at")
    list_filter = ("action", "created_at")
    readonly_fields = ("details",)