import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Trash2 } from "lucide-react";
import type { Report } from "@/api/types";
import { StatusChip } from "@/components/ui";

export function ReportCard({ report }: { report: Report }) {
  const navigate = useNavigate();
  const date = new Date(report.created_at);
  return (
    <div
      onClick={() => navigate(`/reports/${report.id}`)}
      className="bg-surface rounded-card shadow-card overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex gap-3 p-3.5">
        {report.image ? (
          <img
            src={report.image}
            alt="chiqindi"
            className="w-[84px] h-[84px] rounded-2xl object-cover shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-[84px] h-[84px] rounded-2xl bg-slate-100 grid place-items-center shrink-0">
            <Trash2 className="h-7 w-7 text-muted" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <StatusChip status={report.status} label={report.status_display} />
            {report.reward_label && report.status === "APPROVED" && (
              <span className="text-[13px] font-bold text-primary-deeper">{report.reward_label}</span>
            )}
          </div>
          <p className="mt-2 text-[14px] font-semibold text-ink truncate">
            {report.waste_type_display}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[12px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {date.toLocaleDateString("uz-UZ")}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TransactionListItem({
  amount,
  note,
  createdAt,
}: {
  amount: number;
  note: string;
  createdAt: string;
}) {
  const positive = amount >= 0;
  return (
    <div className="flex items-center gap-3.5 px-5 py-4 bg-surface rounded-card shadow-card mb-2.5">
      <div
        className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${
          positive ? "bg-primary-soft text-primary-deeper" : "bg-danger/10 text-danger"
        }`}
      >
        <span className="text-lg font-extrabold">{positive ? "+" : "−"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-ink truncate">{note || "Tranzaksiya"}</p>
        <p className="text-[12px] text-muted mt-0.5">
          {new Date(createdAt).toLocaleString("uz-UZ")}
        </p>
      </div>
      <span className={`text-[15px] font-extrabold ${positive ? "text-primary-deeper" : "text-danger"}`}>
        {positive ? "+" : "−"}{amount.toLocaleString("ru-RU").replace(/,/g, " ")} so'm
      </span>
    </div>
  );
}