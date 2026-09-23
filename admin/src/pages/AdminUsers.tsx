import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { adminApi, type AdminUserRow } from "@/api/adminApi";
import { useData } from "@/hooks/useData";
import { toast } from "@/store/toastStore";
import { Skeleton } from "@/components/ui";

const fmt = (n: number) => `${n.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [tune, setTune] = useState<AdminUserRow | null>(null);
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, loading, reload } = useData(() => adminApi.users(search || undefined), [search]);
  const users = data?.results ?? [];

  const adjust = async () => {
    if (!tune) return;
    setBusy(true);
    try {
      await adminApi.adjustBalance(tune.id, amount, reason);
      toast.success("Balans yangilandi va auditga yozildi");
      setTune(null);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Foydalanuvchilar</h1>
      <p className="text-muted text-sm mt-1">Balansni faqat ozgina va audit qilinadigan holatlarda o'zgartiring</p>

      <div className="mt-5 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Telefon yoki ism bo'yicha qidirish…"
            className="w-full h-12 rounded-xl bg-white shadow-card pl-10 pr-4 text-[14px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card mt-5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[12px] text-muted">
              <th className="px-5 py-3">Foydalanuvchi</th>
              <th className="px-5 py-3">Telefon</th>
              <th className="px-5 py-3">Reports (tasdiqlangan)</th>
              <th className="px-5 py-3">Balans</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}><Skeleton className="h-16 m-3" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Topilmadi</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50">
                  <td className="px-5 py-3.5 font-semibold text-ink">{u.full_name}</td>
                  <td className="px-5 py-3.5 text-muted">{u.phone}</td>
                  <td className="px-5 py-3.5 text-muted">{u.report_stats.total} ({u.report_stats.approved})</td>
                  <td className="px-5 py-3.5 font-bold text-ink">{fmt(u.balance)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setTune(u)}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-ink text-[13px] font-semibold hover:bg-slate-200"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {tune && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-[1000]" onClick={() => setTune(null)}>
          <div className="bg-white rounded-card p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <p className="font-extrabold text-ink">Balansni tuzatish</p>
            <p className="text-muted text-[13px] mt-0.5">{tune.full_name} · {tune.phone}</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Summa (+/-)"
              className="mt-4 w-full h-12 rounded-xl border border-slate-200 px-4"
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sabab"
              className="mt-2 w-full h-12 rounded-xl border border-slate-200 px-4"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => void adjust()}
                disabled={busy}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
              >
                Saqlash
              </button>
              <button onClick={() => setTune(null)} className="h-12 px-5 rounded-xl bg-slate-100 font-semibold">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}