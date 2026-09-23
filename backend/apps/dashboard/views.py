"""Custom admin dashboard API. Staff-only. Never exposed to normal users."""

from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.dashboard.serializers import (
    AdminReportSerializer,
    AdminUserSerializer,
    AdminWithdrawalActionSerializer,
    AdminWithdrawalSerializer,
    ApproveReportSerializer,
    RejectReportSerializer,
)
from apps.dashboard.services import audit
from apps.reports.models import WasteReport
from apps.reports.services import approve_report, reject_report
from apps.rewards.models import AdminActionLog
from apps.transactions.models import Transaction
from apps.transactions.serializers import TransactionSerializer
from apps.withdrawals.models import WithdrawalRequest
from apps.withdrawals.services import (
    approve_withdrawal,
    mark_withdrawal_paid,
    reject_withdrawal,
)


class StatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.users.models import User

        reports = WasteReport.objects
        withdrawals = WithdrawalRequest.objects
        approved_reports = reports.filter(status=WasteReport.Status.APPROVED)

        data = {
            "users_total": User.objects.filter(is_active=True).count(),
            "reports_total": reports.count(),
            "reports_pending": reports.filter(status=WasteReport.Status.PENDING).count(),
            "reports_approved": approved_reports.count(),
            "reports_rejected": reports.filter(status=WasteReport.Status.REJECTED).count(),
            "rewards_total": approved_reports.aggregate(t=Sum("reward_amount"))["t"] or 0,
            "withdrawals_pending": withdrawals.filter(status=WithdrawalRequest.Status.PENDING).count(),
            "withdrawals_paid_total": withdrawals.filter(status=WithdrawalRequest.Status.PAID).aggregate(
                t=Sum("amount")
            )["t"]
            or 0,
            "paid_last_7d": Transaction.objects.filter(
                type=Transaction.Type.WITHDRAWAL,
                status=Transaction.Status.COMPLETED,
                created_at__gte=timezone.now() - timezone.timedelta(days=7),
            ).aggregate(t=Sum("amount"))["t"]
            or 0,
        }
        return Response(data)


class ReportAdminListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = WasteReport.objects.select_related("user").prefetch_related("images")
        st = request.query_params.get("status")
        if st:
            qs = qs.filter(status=st.upper())
        if request.query_params.get("search"):
            qs = qs.filter(user__phone__icontains=request.query_params["search"])
        qs = qs[:200]
        return Response(
            {"results": AdminReportSerializer(qs, many=True, context={"request": request}).data}
        )


class ReportApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        ser = ApproveReportSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        report = WasteReport.objects.get(pk=pk)
        try:
            approve_report(report, request.user, ser.validated_data["amount"])
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        audit(
            request.user, "approve_report", "report", report.pk,
            {"reward": ser.validated_data["amount"]},
        )
        return Response(AdminReportSerializer(report, context={"request": request}).data)


class ReportRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        ser = RejectReportSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        report = WasteReport.objects.get(pk=pk)
        try:
            reject_report(report, request.user, ser.validated_data.get("reason", ""))
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        audit(
            request.user, "reject_report", "report", report.pk,
            {"reason": ser.validated_data.get("reason", "")},
        )
        return Response(AdminReportSerializer(report, context={"request": request}).data)


class WithdrawalAdminListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = WithdrawalRequest.objects.select_related("user")
        st = request.query_params.get("status")
        if st:
            qs = qs.filter(status=st.upper())
        qs = qs[:200]
        return Response({"results": AdminWithdrawalSerializer(qs, many=True).data})


class WithdrawalActionView(APIView):
    """Approve / Reject / Mark as Paid on one endpoint."""

    permission_classes = [IsAdminUser]

    def post(self, request, pk, action):
        withdraw = WithdrawalRequest.objects.get(pk=pk)
        ser = AdminWithdrawalActionSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            if action == "approve":
                approve_withdrawal(withdraw, request.user)
                audit(request.user, "withdrawal_approve", "withdrawal", withdraw.pk, {"amount": withdraw.amount})
            elif action == "reject":
                reject_withdrawal(withdraw, request.user, ser.validated_data.get("note", ""))
                audit(request.user, "withdrawal_reject", "withdrawal", withdraw.pk, {"note": withdraw.note})
            elif action == "mark-paid":
                mark_withdrawal_paid(withdraw, request.user)
                audit(request.user, "withdrawal_paid", "withdrawal", withdraw.pk, {"amount": withdraw.amount})
            else:
                return Response({"detail": "Noma'lum amal."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(AdminWithdrawalSerializer(withdraw).data)


class UserAdminListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.users.models import User

        qs = User.objects.prefetch_related("reports").all()
        search = request.query_params.get("search")
        if search:
            qs = qs.filter(Q(phone__icontains=search) | Q(first_name__icontains=search))
        return Response({"results": AdminUserSerializer(qs[:200], many=True).data})


class UserBalanceAdjustView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        from django.contrib.auth import get_user_model

        from apps.transactions.serializers import (
            AdminAdjustBalanceSerializer,
            apply_adjustment,
        )

        user = get_user_model().objects.get(pk=pk)
        ser = AdminAdjustBalanceSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tx = apply_adjustment(
            user,
            request.user,
            ser.validated_data["amount"],
            ser.validated_data.get("reason", ""),
        )
        audit(
            request.user, "adjust_balance", "user", user.pk,
            {"amount": ser.validated_data["amount"], "reason": ser.validated_data.get("reason", "")},
        )
        return Response(
            {
                "balance": user.balance,
                "transaction": TransactionSerializer(tx).data,
            }
        )


class TransactionAdminListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = Transaction.objects.select_related("user")[:300]
        return Response({"results": TransactionSerializer(qs, many=True).data})


class AuditLogListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = AdminActionLog.objects.select_related("admin")[:200]
        return Response(
            {
                "results": [
                    {
                        "id": log.pk,
                        "admin": log.admin.get_full_name() or log.admin.phone,
                        "action": log.action,
                        "target_type": log.target_type,
                        "target_id": log.target_id,
                        "details": log.details,
                        "created_at": log.created_at.isoformat(),
                    }
                    for log in qs
                ]
            }
        )