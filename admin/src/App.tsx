import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toasts } from "@/components/Toasts";
import AdminLayout from "@/components/AdminLayout";
import { useAuthStore } from "@/store/authStore";
import Login from "@/pages/Login";
import AdminStats from "@/pages/AdminStats";
import AdminReports from "@/pages/AdminReports";
import AdminWithdrawals from "@/pages/AdminWithdrawals";
import AdminUsers from "@/pages/AdminUsers";
import AdminLedger from "@/pages/AdminLedger";
import AdminAudit from "@/pages/AdminAudit";

function AdminOnly() {
  const authed = useAuthStore((s) => s.isAuthed());
  const isStaff = useAuthStore((s) => s.admin?.is_staff);
  if (!authed) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/login" replace />;
  return <AdminLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toasts />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AdminOnly />}>
          <Route path="/" element={<AdminStats />} />
          <Route path="/reports" element={<AdminReports />} />
          <Route path="/withdrawals" element={<AdminWithdrawals />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/ledger" element={<AdminLedger />} />
          <Route path="/audit" element={<AdminAudit />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}