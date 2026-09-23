import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ChevronLeft, Leaf, Wallet } from "lucide-react";
import { notificationsApi } from "@/api/endpoints";
import { useData } from "@/hooks/useData";
import { Screen, EmptyState } from "@/components/ui";
import type { Notification } from "@/api/types";

const typeIcon = {
  report: <Leaf className="h-5 w-5 text-primary-deeper" />,
  reward: <Wallet className="h-5 w-5 text-primary-deeper" />,
  withdrawal: <Wallet className="h-5 w-5 text-primary-deeper" />,
  system: <Bell className="h-5 w-5 text-muted" />,
};

export default function Notifications() {
  const navigate = useNavigate();
  const { data, reload } = useData(() => notificationsApi.list());
  const nots = data?.results ?? [];

  const readAll = async () => {
    await notificationsApi.markAllRead();
    reload();
  };

  const read = async (n: Notification) => {
    if (!n.is_read) {
      await notificationsApi.markRead(n.id);
      reload();
    }
    if (n.type === "report" && n.data?.report_id) navigate(`/reports/${n.data.report_id}`);
  };

  return (
    <Screen className="pb-8">
      <header className="flex items-center gap-3 py-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface shadow-card grid place-items-center text-ink">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[22px] font-extrabold text-ink flex-1">Bildirishnomalar</h1>
        {nots.length > 0 && (
          <button onClick={() => void readAll()} className="text-[13px] font-semibold text-primary-deeper flex items-center gap-1">
            <CheckCheck className="h-4 w-4" /> Hammasi o'qildi
          </button>
        )}
      </header>

      {nots.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="Bildirishnomalar yo'q"
          text="Arizangiz holati haqida bu yerda xabar beriladi"
        />
      ) : (
        <div className="space-y-2.5">
          {nots.map((n) => (
            <button
              key={n.id}
              onClick={() => void read(n)}
              className={`w-full flex items-start gap-3.5 rounded-card shadow-card p-4 text-left transition active:scale-[0.99] ${
                n.is_read ? "bg-surface" : "bg-surface border border-primary/30"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-soft grid place-items-center shrink-0">
                {typeIcon[n.type as keyof typeof typeIcon] ?? <Bell className="h-5 w-5 text-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] leading-snug ${n.is_read ? "text-muted" : "text-ink font-semibold"}`}>
                  {n.title}
                </p>
                {n.body && <p className="text-[12px] text-muted mt-1">{n.body}</p>}
                <p className="text-[11px] text-muted/60 mt-1.5">
                  {new Date(n.created_at).toLocaleString("uz-UZ")}
                </p>
              </div>
              {!n.is_read && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />}
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}