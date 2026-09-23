import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="app-frame">
        <main className="pb-safe px-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}