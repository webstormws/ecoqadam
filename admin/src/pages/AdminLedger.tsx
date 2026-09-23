import { adminApi } from "@/api/adminApi";
import { useData } from "@/hooks/useData";
import { Skeleton } from "@/components/ui";

const fmt = (n: number) => `${Math.abs(n).toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;

export default function AdminLedger() {
  const txs = useData(() => adminApi.transactions());

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Tranzaksiyalar</h1>
      <p className="text-muted text-sm mt-1">Umumiy moliyaviy harakatlar jurnali</p>

      <div className="bg-white rounded-card shadow-card mt-5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[12px] text-muted">
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Summa</th>
              <th className="px-5 py-3">Turi</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Manba</th>
              <th className="px-5 py-3">Izoh</th>
              <th className="px-5 py-3">Sana</th>
            </tr>
          </thead>
          <tbody>
            {txs.loading ? (
              <tr><td colSpan={7}><Skeleton className="h-16 m-3" /></td></tr>
            ) : (txs.data?.results.length ?? 0) === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">Tranzaksiyalar yo'q</td></tr>
            ) : (
              txs.data?.results.map((t) => (
                <tr key={t.id} className="border-b border-slate-50">
                  <td className="px-5 py-3 text-muted">{t.id}</td>
                  <td className={`px-5 py-3 font-bold ${t.amount >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(t.amount)}</td>
                  <td className="px-5 py-3 font-semibold text-ink">{t.type_display}</td>
                  <td className="px-5 py-3 text-muted">{t.status_display}</td>
                  <td className="px-5 py-3 text-[13px] text-muted">{t.reference || "—"}</td>
                  <td className="px-5 py-3 text-[13px] text-muted">{t.note || "—"}</td>
                  <td className="px-5 py-3 text-[13px] text-muted">{new Date(t.created_at).toLocaleString("uz-UZ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}