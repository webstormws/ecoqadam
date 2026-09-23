import { useState } from "react";
import { Banknote, Check, CreditCard, X } from "lucide-react";
import { adminApi, type AdminWithdrawal } from "@/api/adminApi";
import { useData } from "@/hooks/useData";
import { toast } from "@/store/toastStore";
import { Skeleton } from "@/components/ui";

const fmt = (n: number) => `${n.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
const tone: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50",
  APPROVED: "text-blue-600 bg-blue-50",
  PAID: "text-green-700 bg-green-50",
  REJECTED: "text-red-600 bg-red-50",
};

export default function AdminWithdrawals() {
  const [filter, setFilter] = useState("PENDING");
  const { data, loading, reload } = useData(() => adminApi.withdrawals({ status: filter }), [filter]);
  const rows = data?.results ?? [];
  const [busyId, setBusyId] = useState<number | null>(null);

  const act = async (w: AdminWithdrawal, action: "approve" | "reject" | "mark-paid", msg: string) => {
    setBusyId(w.id);
    try {
      await adminApi.withdrawalAction(w.id, action);
      reload();
      toast.success(msg);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Pul yechish so'rovlari</h1>
          <p className="text-muted text-sm mt-1">To'lovni tasdiqlab, "To'landi" holatiga o'tkazing</p>
        </div>
        <div className="flex gap-2">
          {["PENDING", "APPROVED", "PAID", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-pill text-[13px] font-semibold transition-colors ${
                filter === s ? "bg-primary text-white" : "bg-white text-muted shadow-card"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mt-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-card shadow-card p-10 text-center text-muted">So'rovlar yo'q</div>
        ) : (
          rows.map((w) => (
            <div key={w.id} className="bg-white rounded-card shadow-card p-4 flex flex-wrap items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 grid place-items-center text-indigo-600 shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="font-extrabold text-ink">{fmt(w.amount)}</p>
                <p className="text-[13px] text-muted">{w.user_name} · {w.user_phone}</p>
                <p className="text-[12px] text-muted">{w.masked_card} · {new Date(w.created_at).toLocaleString("uz-UZ")}</p>
              </div>
              <span className={`text-[12px] font-bold px-3 py-1.5 rounded-full ${tone[w.status]}`}>{w.status_display}</span>
              {w.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => act(w, "approve", "Tasdiqlandi — to'lov belgilanadi")}
                    disabled={busyId === w.id}
                    className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-blue-500 text-white text-[13px] font-semibold disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => act(w, "mark-paid", "To'landi")}
                    disabled={busyId === w.id}
                    className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-green-600 text-white text-[13px] font-semibold disabled:opacity-50"
                  >
                    <Banknote className="h-4 w-4" /> Mark as Paid
                  </button>
                  <button
                    onClick={() => act(w, "reject", "Rad etildi")}
                    disabled={busyId === w.id}
                    className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-red-500 text-white text-[13px] font-semibold disabled:opacity-50"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
              {w.status === "APPROVED" && (
                <button
                  onClick={() => act(w, "mark-paid", "To'landi")}
                  disabled={busyId === w.id}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-green-600 text-white text-[13px] font-semibold disabled:opacity-50"
                >
                  <Banknote className="h-4 w-4" /> Mark as Paid
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}