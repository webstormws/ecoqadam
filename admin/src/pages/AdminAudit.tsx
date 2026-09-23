import { ScrollText } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { useData } from "@/hooks/useData";
import { Skeleton } from "@/components/ui";

const actionLabel: Record<string, string> = {
  approve_report: "Arizani tasdiqlash",
  reject_report: "Arizani rad etish",
  withdrawal_approve: "Yechib olishni tasdiqlash",
  withdrawal_reject: "Yechib olishni rad etish",
  withdrawal_paid: "To'lovni belgilash",
  adjust_balance: "Balansni tuzatish",
  user_update: "Foydalanuvchini tahrirlash",
};

export default function AdminAudit() {
  const { data, loading } = useData(() => adminApi.audit());
  const rows = data?.results ?? [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Audit jurnali</h1>
      <p className="text-muted text-sm mt-1">Pul va holatlarga ta'sir qilgan barcha admin amallari</p>

      <div className="bg-white rounded-card shadow-card mt-5 overflow-hidden">
        {loading ? (
          <Skeleton className="h-40 m-3" />
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted flex flex-col items-center gap-2">
            <ScrollText className="h-8 w-8" /> Amallar hali qayd etilmagan
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {rows.map((log) => (
              <div key={log.id} className="px-5 py-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-soft grid place-items-center text-primary-deeper shrink-0">
                  <ScrollText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ink">
                    {actionLabel[log.action] ?? log.action}
                    <span className="text-muted font-normal"> · {log.admin}</span>
                  </p>
                  <p className="text-[12px] text-muted mt-0.5">
                    {log.target_type} #{log.target_id}
                    {Object.keys(log.details).length > 0 && ` · ${JSON.stringify(log.details)}`}
                  </p>
                </div>
                <span className="text-[12px] text-muted shrink-0">
                  {new Date(log.created_at).toLocaleString("uz-UZ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}