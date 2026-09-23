from django.urls import path

from apps.transactions.views import BalanceView, TransactionListView

urlpatterns = [
    path("balance/", BalanceView.as_view(), name="balance"),
    path("transactions/", TransactionListView.as_view(), name="transactions"),
]