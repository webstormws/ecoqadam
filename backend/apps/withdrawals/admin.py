from django.contrib import admin

from apps.withdrawals.models import WithdrawalRequest


@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "masked_card", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__phone", "card_number")
    readonly_fields = ("processed_at", "created_at", "updated_at")
    list_select_related = ("user",)