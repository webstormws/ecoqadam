import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { authApi } from "@/api/endpoints";
import { errorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { AuthShell } from "@/components/AuthShell";
import { Button, Field } from "@/components/ui";
import TelegramButton from "@/components/TelegramLoginButton";
import { useDidMount } from "@/hooks/useDidMount";

export default function Login() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useDidMount(() => {
    if (useAuthStore.getState().isAuthed()) navigate("/", { replace: true });
  });

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login({ phone, password });
      setTokens(data.access, data.refresh);
      try {
        const me = await authApi.me();
        setProfile(me);
      } catch {
        /* fallback: user data already in payload */
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Chiqindi haqida xabar bering va mukofot oling">
      <form
        className="bg-surface rounded-card shadow-card p-6 animate-fade-up"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="space-y-4">
          <Field
            label="Telefon raqami"
            type="tel"
            inputMode="tel"
            placeholder="+998 __ ___ __ __"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Field
            label="Parol"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-danger text-[13px] font-medium">{error}</p>}
          <Button type="submit" loading={loading}>
            <Send className="h-4 w-4" /> Kirish
          </Button>
          <TelegramButton />
        </div>
        <p className="text-center text-[13px] text-muted mt-5">
          Akkauntingiz yo'qmi?{" "}
          <Link to="/register" className="font-semibold text-primary-deeper">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}