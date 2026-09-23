import { useState } from "react";
import { Check, MapPin, Phone, Trash2, X } from "lucide-react";
import { adminApi, type AdminReport } from "@/api/adminApi";
import { useData } from "@/hooks/useData";
import { toast } from "@/store/toastStore";
import { Skeleton, StatusChip } from "@/components/ui";
import { MiniMap } from "@/components/MiniMap";

const fmt = (n: number) => `${n.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
const statusTone: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50",
  APPROVED: "text-green-700 bg-green-50",
  REJECTED: "text-red-600 bg-red-50",
};

export default function AdminReports() {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<AdminReport | null>(null);
  const { data, loading, reload } = useData(() => adminApi.reports({ status: filter || undefined }), [filter]);
  const reports = data?.results ?? [];

  const open = (r: AdminReport) => setSelected(r);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Arizalar</h1>
          <p className="text-muted text-sm mt-1">Rasmlarni tekshiring va mukofotni belgilang</p>
        </div>
        <div className="flex gap-2">
          {["", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-pill text-[13px] font-semibold transition-colors ${
                filter === s ? "bg-primary text-white" : "bg-white text-muted shadow-card"
              }`}
            >
              {s || "Barchasi"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* List */}
        <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-card shadow-card p-10 text-center text-muted">Arizalar topilmadi</div>
          ) : (
            reports.map((r) => (
              <button
                key={r.id}
                onClick={() => open(r)}
                className={`w-full text-left bg-white rounded-card shadow-card overflow-hidden transition ${
                  selected?.id === r.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex gap-3 p-3">
                  {r.image ? (
                    <img src={r.image} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-100 grid place-items-center"><Trash2 className="text-muted" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-ink">#{r.id} · {r.waste_type_display}</span>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${statusTone[r.status]}`}>{r.status}</span>
                    </div>
                    <p className="text-[13px] text-muted mt-1 flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {r.user_phone}
                    </p>
                    <p className="text-[12px] text-muted mt-0.5">{new Date(r.created_at).toLocaleString("uz-UZ")}</p>
                    {r.status === "APPROVED" && <p className="text-[13px] font-bold text-green-700 mt-1">+ {fmt(r.reward_amount)}</p>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <ReportDetail adminReport={selected} reload={reload} onClose={() => setSelected(null)} />
          ) : (
            <div className="bg-white rounded-card shadow-card p-10 text-center text-muted h-full">
              Ko'rish uchun arizani tanlang
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportDetail({
  adminReport: r,
  reload,
  onClose,
}: {
  adminReport: AdminReport;
  reload: () => void;
  onClose: () => void;
}) {
  const [reward, setReward] = useState(r.status === "APPROVED" ? r.reward_amount : 10000);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(r);

  const act = async (fn: () => Promise<AdminReport>, msg: string) => {
    setBusy(true);
    try {
      const updated = await fn();
      setData(updated);
      reload();
      toast.success(msg);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-extrabold text-ink text-lg">Ariza #{data.id}</p>
          <p className="text-[13px] text-muted">{data.user_name} · {data.user_phone}</p>
        </div>
        <button onClick={onClose} className="text-muted"><X className="h-5 w-5" /></button>
      </div>

      <div className="mt-4">
        {data.image ? (
          <img src={data.image} alt="chiqindi" className="w-full aspect-video object-cover rounded-2xl" />
        ) : (
          <div className="w-full aspect-video bg-slate-100 rounded-2xl grid place-items-center"><Trash2 className="text-muted" /></div>
        )}
      </div>

      <div className="mt-4 my-4 grid grid-cols-2 gap-2 text-[13px]">
        <Meta label="Turi" value={data.waste_type_display} />
        <Meta label="Status" value={data.status_display} status={data.status} />
        <Meta label="Sana" value={new Date(data.created_at).toLocaleString("uz-UZ")} />
        <Meta label="Koordinatalar" value={`${Number(data.latitude).toFixed(5)}, ${Number(data.longitude).toFixed(5)}`} />
      </div>

      {data.description && (
        <p className="text-[13px] text-ink bg-bg rounded-xl p-3 mb-3">{data.description}</p>
      )}

      <div className="rounded-2xl overflow-hidden h-44 mb-5">
        <MiniMap lat={Number(data.latitude)} lng={Number(data.longitude)} interactive />
      </div>

      {data.status === "PENDING" ? (
        <div className="space-y-3">
          <label className="block">
            <span className="text-[13px] font-semibold text-ink">Mukofot summasi (so'm)</span>
            <input
              type="number"
              value={reward}
              min={1000}
              onChange={(e) => setReward(Number(e.target.value))}
              className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 px-4 text-[15px] font-bold"
            />
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rad etish sababi (ixtiyoriy)"
            className="w-full h-12 rounded-xl border border-slate-200 px-4 text-[14px]"
          />
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => act(() => adminApi.approveReport(data.id, reward), "Ariza tasdiqlandi")}
              disabled={busy}
              className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Tasdiqlash
            </button>
            <button
              onClick={() => act(() => adminApi.rejectReport(data.id, reason), "Ariza rad etildi")}
              disabled={busy}
              className="flex items-center justify-center gap-2 h-12 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50"
            >
              <X className="h-4 w-4" /> Rad etish
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-bg rounded-xl p-4 text-[14px] font-semibold">
          <span className="flex items-center gap-2 text-muted"><MapPin className="h-4 w-4" /> {data.status_display}</span>
          {data.status === "APPROVED" && <span className="text-green-700">+ {fmt(data.reward_amount)}</span>}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value, status }: { label: string; value: string; status?: string }) {
  return (
    <div className="bg-bg rounded-xl px-3 py-2">
      <p className="text-[11px] text-muted">{label}</p>
      {status ? (
        <StatusChip status={status} label={value} />
      ) : (
        <p className="font-semibold text-ink mt-0.5">{value}</p>
      )}
    </div>
  );
}