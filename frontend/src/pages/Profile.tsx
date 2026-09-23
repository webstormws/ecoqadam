import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  Leaf,
  LogOut,
  Shield,
  Smartphone,
} from "lucide-react";
import { authApi, reportsApi } from "@/api/endpoints";
import { useAuthStore } from "@/store/authStore";
import { useData } from "@/hooks/useData";
import { Screen, Avatar, Skeleton } from "@/components/ui";

export default function Profile() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const logout = useAuthStore((s) => s.logout);
  const reports = useData(() => reportsApi.list());

  const user = profile?.user;
  const [notifOn, setNotifOn] = useState(profile?.notifications_enabled ?? true);

  const toggleNotif = async () => {
    const next = !notifOn;
    setNotifOn(next);
    try {
      const p = await authApi.updateProfile({ notifications_enabled: next });
      setProfile(p);
    } catch {
      setNotifOn(!next);
    }
  };

  return (
    <Screen className="pb-8">
      <header className="pt-4 pb-5">
        <h1 className="text-[24px] font-extrabold text-ink">Profil</h1>
      </header>

      {/* Card */}
      <div className="bg-surface rounded-card shadow-card p-5 flex items-center gap-4">
        <Avatar src={user?.avatar_url} name={user?.full_name ?? "?"} size={64} />
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-extrabold text-ink truncate">{user?.full_name ?? "Foydalanuvchi"}</p>
          <p className="text-[13px] text-muted mt-0.5">{user?.phone}</p>
          {user?.telegram_username && (
            <p className="text-[12px] text-primary-deeper mt-0.5">@{user.telegram_username}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mt-3.5">
        {[
          { label: "Yuborilgan", value: reports.data?.summary.total, sub: "ariza" },
          { label: "Tasdiqlangan", value: reports.data?.summary.approved, sub: "ariza" },
          { label: "Ishlab topilgan", value: reports.data?.summary.earned, sub: "so'm" },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-card shadow-card p-3.5 text-center">
            {reports.loading ? (
              <Skeleton className="h-5 w-12 mx-auto" />
            ) : (
              <p className="font-extrabold text-ink text-[17px] leading-none">
                {s.label === "Ishlab topilgan"
                  ? (s.value ?? 0).toLocaleString("ru-RU").replace(/,/g, " ")
                  : (s.value ?? 0)}
              </p>
            )}
            <p className="text-[11px] text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info rows */}
      <div className="bg-surface rounded-card shadow-card mt-4 divide-y divide-slate-50">
        <Row icon={<Smartphone className="h-4.5 w-4.5" />} label="Telefon" value={user?.phone} />
        <Row icon={<Leaf className="h-4.5 w-4.5" />} label="Telegram" value={user?.telegram_id ? "Ulangan" : "Ulanmagan"} />
        <Row
          icon={<Globe className="h-4.5 w-4.5" />}
          label="Ro'yxatdan o'tgan sana"
          value={user?.date_joined ? new Date(user.date_joined).toLocaleDateString("uz-UZ") : undefined}
        />
      </div>

      {/* Settings */}
      <h2 className="text-[15px] font-bold mt-6 mb-3">Sozlamalar</h2>
      <div className="bg-surface rounded-card shadow-card divide-y divide-slate-50 overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 text-left"
          onClick={toggleNotif}
        >
          <span className="flex items-center gap-3 text-[14px] font-semibold text-ink">
            <Bell className="h-4.5 w-4.5 text-muted" /> Bildirishnomalar
          </span>
          <span
            className={`w-11 h-6 rounded-pill p-0.5 transition-colors ${notifOn ? "bg-primary" : "bg-slate-200"}`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${notifOn ? "translate-x-5" : ""}`}
            />
          </span>
        </button>
        <Row icon={<Globe className="h-4.5 w-4.5" />} label="Til" value="O'zbekcha" navigate={() => navigate("/profile")} />
        <Row icon={<HelpCircle className="h-4.5 w-4.5" />} label="Yordam" navigate={() => navigate("/profile")} />
        <Row icon={<Shield className="h-4.5 w-4.5" />} label="Maxfiylik" navigate={() => navigate("/profile")} />
      </div>

      <button
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
        className="w-full mt-4 flex items-center justify-center gap-2 rounded-card bg-danger/10 text-danger h-13 py-4 px-5 font-semibold text-[14px] active:scale-[0.98] transition-transform"
      >
        <LogOut className="h-4.5 w-4.5" /> Chiqish
      </button>
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
  navigate: onNav,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  navigate?: () => void;
}) {
  return (
    <button onClick={onNav} className="w-full flex items-center gap-3 px-5 py-4 text-left disabled:opacity-100">
      <span className="text-muted shrink-0">{icon}</span>
      <span className="text-[14px] font-semibold text-ink flex-1">{label}</span>
      {value && <span className="text-[12px] text-muted">{value}</span>}
      {onNav && <ChevronRight className="h-4 w-4 text-muted" />}
    </button>
  );
}