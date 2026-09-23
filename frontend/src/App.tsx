import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { Toasts } from "@/components/Toasts";
import { useAuthStore } from "@/store/authStore";
import Login from "@/pages/Auth.Login";
import Register from "@/pages/Auth.Register";
import TelegramCallback from "@/pages/Auth.TelegramCallback";
import Home from "@/pages/Home";
import SubmitWaste from "@/pages/Submit.Waste";
import SubmitSuccess from "@/pages/Submit.Success";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import MapScreen from "@/pages/MapScreen";
import Balance from "@/pages/Balance";
import Withdraw from "@/pages/Withdraw";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";

function Protected() {
  const authed = useAuthStore((s) => s.isAuthed());
  if (!authed) return <Navigate to="/login" replace />;
  return (
    <AppShell />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toasts />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/telegram" element={<TelegramCallback />} />
        <Route element={<Protected />}>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitWaste />} />
          <Route path="/submit/success" element={<SubmitSuccess />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}