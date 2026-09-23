from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.withdrawals.serializers import (
    WithdrawalCreateSerializer,
    WithdrawalSerializer,
)
from apps.withdrawals.services import create_withdrawal


class WithdrawalListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = request.user.withdrawal_requests.all()
        return Response({"results": WithdrawalSerializer(qs, many=True).data})

    def post(self, request):
        ser = WithdrawalCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            withdrawal = create_withdrawal(
                request.user,
                ser.validated_data["amount"],
                ser.validated_data["card_number"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(WithdrawalSerializer(withdrawal).data, status=status.HTTP_201_CREATED)


class WithdrawalDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            obj = request.user.withdrawal_requests.get(pk=pk)
        except request.user.withdrawal_requests.model.DoesNotExist:
            return Response({"detail": "Topilmadi."}, status=status.HTTP_404_NOT_FOUND)
        return Response(WithdrawalSerializer(obj).data)