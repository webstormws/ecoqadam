from django.contrib import admin

from apps.reports.models import WasteImage, WasteReport


class WasteImageInline(admin.TabularInline):
    model = WasteImage
    extra = 0


@admin.register(WasteReport)
class WasteReportAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "waste_type", "status", "reward_amount", "latitude", "longitude", "created_at")
    list_filter = ("status", "waste_type", "created_at")
    search_fields = ("user__phone", "address", "description")
    readonly_fields = ("client_uid", "created_at", "updated_at", "reviewed_at")
    inlines = [WasteImageInline]
    list_select_related = ("user",)