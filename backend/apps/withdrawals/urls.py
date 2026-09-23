from django.urls import path

from apps.withdrawals.views import WithdrawalDetailView, WithdrawalListCreateView

urlpatterns = [
    path("", WithdrawalListCreateView.as_view(), name="withdrawal-list"),
    path("<int:pk>/", WithdrawalDetailView.as_view(), name="withdrawal-detail"),
]