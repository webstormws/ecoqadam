import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-white shrink-0" />,
  error: <XCircle className="h-5 w-5 text-white shrink-0" />,
  info: <Info className="h-5 w-5 text-white shrink-0" />,
};

const tone = {
  success: "bg-primary-dark",
  error: "bg-danger",
  info: "bg-ink",
};

export function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-[1000] flex flex-col items-center gap-2 px-4 pt-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 text-white text-[14px] font-medium px-4 py-3 rounded-pill shadow-card max-w-full animate-fade-up ${tone[t.kind]}`}
        >
          {icons[t.kind]}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}