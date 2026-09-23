import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Landmark,
  LayoutGrid,
  Leaf,
  LogOut,
  ScrollText,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const nav = [
  { to: "/", label: "Statistika", icon: BarChart3, end: true },
  { to: "/reports", label: "Arizalar", icon: Leaf },
  { to: "/withdrawals", label: "To'lovlar", icon: Landmark },
  { to: "/users", label: "Foydalanuvchilar", icon: Users },
  { to: "/ledger", label: "Tranzaksiyalar", icon: LayoutGrid },
  { to: "/audit", label: "Audit jurnali", icon: ScrollText },
];

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-100 p-4 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="w-8 h-8 rounded-full bg-primary grid place-items-center">
            <Leaf className="h-4 w-4 text-white" fill="currentColor" strokeWidth={0} />
          </div>
          <div>
            <p className="font-extrabold text-ink leading-none">Eco Qadam</p>
            <p className="text-[11px] text-muted mt-1">Admin panel</p>
          </div>
        </div>
        <nav className="mt-4 space-y-1 flex-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                  isActive ? "bg-primary-soft text-primary-deeper" : "text-muted hover:bg-slate-50"
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-danger hover:bg-danger/5"
        >
          <LogOut className="h-[18px] w-[18px]" /> Chiqish
        </button>
      </aside>

      <main className="flex-1 p-6 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}