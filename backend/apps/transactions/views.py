from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.transactions.models import Transaction
from apps.transactions.serializers import TransactionSerializer


class BalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = request.user.transactions.filter(status=Transaction.Status.COMPLETED)
        earned = (
            qs.filter(type__in=[Transaction.Type.REWARD]).aggregate(total=Sum("amount"))["total"] or 0
        )
        return Response(
            {
                "balance": request.user.balance,
                "earned_total": earned,
                "pending_withdrawal": request.user.withdrawal_requests.filter(
                    status__in=["PENDING", "APPROVED"]
                ).count(),
            }
        )


class TransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = request.user.transactions.select_related("user")[:200]
        return Response({"results": TransactionSerializer(qs, many=True).data})