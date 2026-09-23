import { Leaf, Map, Home, Wallet, User as UserIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Bosh", icon: Home, end: true },
  { to: "/reports", label: "Xabarlar", icon: Leaf, end: false },
  { to: "/map", label: "Xarita", icon: Map, end: false },
  { to: "/balance", label: "Balans", icon: Wallet, end: false },
  { to: "/profile", label: "Profil", icon: UserIcon, end: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-[900]">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="mx-3 mb-3 px-2 py-2 rounded-pill bg-white/95 backdrop-blur-md shadow-card border border-slate-100 flex items-center justify-between">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-pill px-3.5 py-1.5 transition-all duration-200 ${
                  isActive ? "bg-primary-soft text-primary-deeper" : "text-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 2} />
                  <span className="text-[10px] font-semibold">{isActive ? item.label : item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}