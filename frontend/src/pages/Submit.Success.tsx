import { useLocation, useNavigate } from "react-router-dom";
import { Check, Home as HomeIcon } from "lucide-react";
import type { Report } from "@/api/types";
import { Button, StatusChip } from "@/components/ui";

export default function SubmitSuccess() {
  const navigate = useNavigate();
  const state = useLocation().state as { report?: Report } | null;
  const report = state?.report;

  return (
    <div className="app-frame min-h-screen bg-bg grid place-items-center px-6">
      <div className="w-full max-w-[400px] flex flex-col items-center text-center animate-fade-up">
        <div className="relative w-24 h-24 mb-6">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-primary grid place-items-center">
            <Check className="h-11 w-11 text-white animate-check-pop" strokeWidth={3} />
          </div>
        </div>

        <h1 className="text-[26px] font-extrabold text-ink leading-tight">
          Rahmat! Ekologiyaga qo'shgan hissangiz uchun.
        </h1>
        <p className="text-muted text-[15px] mt-2 leading-relaxed">
          Arizangiz admin tomonidan ko'rib chiqilmoqda. Tasdiqlansangiz, mukofot avtomatik balansingizga qo'shiladi.
        </p>

        <div className="w-full bg-surface rounded-card shadow-card p-5 mt-7 flex items-center justify-between">
          <div className="text-left">
            <p className="text-[12px] text-muted">Ariza raqami</p>
            <p className="font-bold text-ink">#{report?.id ?? "…"}</p>
          </div>
          <StatusChip status={report?.status ?? "PENDING"} label={report?.status_display ?? "Ko'rib chiqilmoqda"} />
        </div>

        <Button className="mt-7" onClick={() => navigate("/", { replace: true })}>
          <HomeIcon className="h-5 w-5" /> Bosh sahifaga
        </Button>
        <Button variant="ghost" onClick={() => navigate("/reports")} className="mt-2">
          Xabarlarimni ko'rish
        </Button>
      </div>
    </div>
  );
}