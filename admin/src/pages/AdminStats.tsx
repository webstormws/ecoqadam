import { Leaf, Landmark, Users, Wallet } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { useData } from "@/hooks/useData";
import { Skeleton } from "@/components/ui";

const fmt = (n: number) => `${(n < 0 ? -n : n).toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;

export default function AdminStats() {
  const { data, loading } = useData(() => adminApi.stats());

  if (loading || !data) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Jami foydalanuvchilar", value: String(data.users_total), icon: Users, tone: "bg-blue-50 text-blue-600" },
    { label: "Jami arizalar", value: String(data.reports_total), icon: Leaf, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Kutilayotgan arizalar", value: String(data.reports_pending), icon: Leaf, tone: "bg-amber-50 text-amber-600" },
    { label: "Tasdiqlangan arizalar", value: String(data.reports_approved), icon: Leaf, tone: "bg-green-50 text-green-600" },
    { label: "Rad etilgan arizalar", value: String(data.reports_rejected), icon: Leaf, tone: "bg-red-50 text-red-600" },
    { label: "Berilgan mukofotlar", value: fmt(data.rewards_total), icon: Wallet, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Kutilayotgan to'lovlar", value: String(data.withdrawals_pending), icon: Landmark, tone: "bg-amber-50 text-amber-600" },
    { label: "Oxirgi 7 kunda yechilgan", value: fmt(data.paid_last_7d), icon: Landmark, tone: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Statistika</h1>
      <p className="text-muted text-sm mt-1">Platforma holati haqida umumiy ma'lumot</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-card shadow-card p-5">
            <div className={`w-10 h-10 rounded-xl grid place-items-center ${c.tone}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-[22px] font-extrabold text-ink mt-3 leading-none">{c.value}</p>
            <p className="text-[13px] text-muted mt-1.5">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}