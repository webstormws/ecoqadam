  import { useMemo } from "react";
  import { useNavigate } from "react-router-dom";
  import { Bell, ChevronRight, Leaf, PlusCircle } from "lucide-react";
  import { authApi, notificationsApi, reportsApi } from "@/api/endpoints";
  import { useAuthStore } from "@/store/authStore";
  import { useData } from "@/hooks/useData";
  import { Screen, Card, SectionLabel, Button, Skeleton, EmptyState } from "@/components/ui";
  import { ReportCard } from "@/components/cards";
  import { fmt } from "@/api/types";

  export default function Home() {
    const navigate = useNavigate();
    const profile = useAuthStore((s) => s.profile);
    const setProfile = useAuthStore((s) => s.setProfile);
    const reports = useData(() => reportsApi.list());
    const notif = useData(() => notificationsApi.list());

    const { data: reportsData } = reports;
    const summary = reportsData?.summary;

    useMemo(() => {
      if (!profile) {
        authApi
          .me()
          .then(setProfile)
          .catch(() => undefined);
      }
    }, [profile, setProfile]);

    const user = profile?.user;

    return (
      <Screen>
        {/* Top bar */}
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary grid place-items-center">
              <Leaf className="h-5 w-5 text-white" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <p className="text-[15px] font-extrabold leading-none text-ink">Eco Qadam</p>
              <p className="text-[12px] text-muted mt-1">Assalomu alaykum, {user?.first_name || "Foydalanuvchi"} 👋</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/notifications")}
            className="relative w-11 h-11 rounded-full bg-surface shadow-card grid place-items-center text-ink"
            aria-label="Bildirishnomalar"
          >
            <Bell className="h-5 w-5" />
            {(notif.data?.unread ?? 0) > 0 && (
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full bg-danger" />
            )}
          </button>
        </header>

        {/* Hero card */}
        <Card className="bg-primary !shadow-floating !p-6 !rounded-[24px] relative overflow-hidden">
          <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-12 w-20 h-20 rounded-full bg-white/10" />
          <p className="text-white/90 text-[14px] font-medium">Ekologiyaga qo'shgan hissangiz</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Jami yuborilgan", value: summary ? String(summary.total) : "–" },
              { label: "Tasdiqlangan", value: summary ? String(summary.approved) : "–" },
              { label: "Ishlab topilgan", value: summary ? fmt(summary.earned) : "–" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-2xl px-3 py-3 backdrop-blur-sm">
                <p className="text-white font-extrabold text-[16px] leading-tight">{s.value}</p>
                <p className="text-white/80 text-[11px] mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
          <Button
            full
            className="mt-5 !bg-white !text-primary-deeper !shadow-none hover:!bg-white/95"
            onClick={() => navigate("/submit")}
          >
            <PlusCircle className="h-5 w-5" />
            Chiqindi haqida xabar berish
          </Button>
        </Card>

        {/* Recent activity */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel className="mb-0">Oxirgi faoliyat</SectionLabel>
            <button onClick={() => navigate("/reports")} className="flex items-center text-[13px] font-semibold text-primary-deeper">
              Barchasi <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {reports.loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-surface rounded-card shadow-card p-3.5 flex gap-3">
                  <Skeleton className="w-[84px] h-[84px]" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (reportsData?.results?.length ?? 0) === 0 ? (
            <Card>
              <EmptyState
                icon={<Leaf className="h-8 w-8" />}
                title="Hozircha arizalar yo'q"
                text="Birinchi bo'lib chiqindi haqida xabar bering!"
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {reportsData?.results.slice(0, 3).map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}
            </div>
          )}
        </div>
      </Screen>
    );
  }