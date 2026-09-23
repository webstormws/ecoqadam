import { useNavigate, useParams } from "react-router-dom";
import { Calendar, ChevronLeft, Clock, MapPin, Tag } from "lucide-react";
import { reportsApi } from "@/api/endpoints";
import { useData } from "@/hooks/useData";
import { Screen, Skeleton, StatusChip, SectionLabel } from "@/components/ui";
import { MiniMap } from "@/components/MiniMap";
import { fmt } from "@/api/types";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: report, loading } = useData(() => reportsApi.detail(Number(id)));

  if (loading || !report) {
    return (
      <Screen>
        <header className="pt-4 pb-5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface shadow-card grid place-items-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Skeleton className="h-6 w-40" />
        </header>
        <Skeleton className="h-72 w-full rounded-card" />
        <div className="space-y-3 mt-5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Screen>
    );
  }

  const d = new Date(report.created_at);

  return (
    <Screen className="pb-8">
      <header className="flex items-center gap-3 py-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface shadow-card grid place-items-center text-ink"
          aria-label="Orqaga"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </header>

      <div className="relative rounded-card overflow-hidden shadow-card">
        {report.image ? (
          <img src={report.image} alt="chiqindi" className="w-full aspect-[4/3] object-cover" />
        ) : (
          <div className="w-full aspect-[4/3] bg-slate-100" />
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <StatusChip status={report.status} label={report.status_display} />
          {report.reward_label && report.status === "APPROVED" && (
            <span className="bg-ink/80 text-white text-[13px] font-bold px-3 py-1.5 rounded-pill">
              {report.reward_label}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold text-ink">{report.waste_type_display}</h1>
          {report.reward_amount > 0 && report.status === "APPROVED" && (
            <span className="text-primary-deeper font-extrabold text-lg">+ {fmt(report.reward_amount)}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Sana" value={d.toLocaleDateString("uz-UZ")} />
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Vaqt" value={d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })} />
          <InfoRow icon={<Tag className="h-4 w-4" />} label="Turi" value={report.waste_type_display} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Koordinata" value={`${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)}`} />
        </div>

        {report.description && (
          <div className="bg-surface rounded-card shadow-card p-4">
            <SectionLabel className="text-[13px]">Izoh</SectionLabel>
            <p className="text-[14px] text-ink leading-relaxed">{report.description}</p>
          </div>
        )}

        <div>
          <SectionLabel>Joylashuv</SectionLabel>
          <div className="rounded-card overflow-hidden shadow-card h-52">
            <MiniMap lat={Number(report.latitude)} lng={Number(report.longitude)} />
          </div>
        </div>
      </div>
    </Screen>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface rounded-card shadow-card p-3.5 flex items-center gap-2.5">
      <span className="text-primary-deeper shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        <p className="text-[13px] font-semibold text-ink truncate">{value}</p>
      </div>
    </div>
  );
}