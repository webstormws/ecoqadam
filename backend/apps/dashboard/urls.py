from django.urls import path

from apps.dashboard.views import (
    AuditLogListView,
    ReportAdminListView,
    ReportApproveView,
    ReportRejectView,
    StatsView,
    TransactionAdminListView,
    UserAdminListView,
    UserBalanceAdjustView,
    WithdrawalActionView,
    WithdrawalAdminListView,
)

urlpatterns = [
    path("stats/", StatsView.as_view(), name="admin-stats"),
    path("reports/", ReportAdminListView.as_view(), name="admin-reports"),
    path("reports/<int:pk>/approve/", ReportApproveView.as_view(), name="admin-report-approve"),
    path("reports/<int:pk>/reject/", ReportRejectView.as_view(), name="admin-report-reject"),
    path("withdrawals/", WithdrawalAdminListView.as_view(), name="admin-withdrawals"),
    path("withdrawals/<int:pk>/<str:action>/", WithdrawalActionView.as_view(), name="admin-withdrawal-action"),
    path("users/", UserAdminListView.as_view(), name="admin-users"),
    path("users/<int:pk>/adjust-balance/", UserBalanceAdjustView.as_view(), name="admin-adjust-balance"),
    path("transactions/", TransactionAdminListView.as_view(), name="admin-transactions"),
    path("audit-log/", AuditLogListView.as_view(), name="admin-audit-log"),
]