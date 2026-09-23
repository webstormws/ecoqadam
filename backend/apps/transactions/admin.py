from django.contrib import admin

from apps.transactions.models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "type", "status", "reference", "created_at")
    list_filter = ("type", "status", "created_at")
    search_fields = ("user__phone", "reference", "note")
    readonly_fields = ("created_at",)
    list_select_related = ("user",)