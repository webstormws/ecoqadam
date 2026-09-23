import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { authApi } from "@/api/adminApi";
import { errorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { AuthShell } from "@/components/AuthShell";
import { Button, Field } from "@/components/ui";

export default function Login() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setAdmin = useAuthStore((s) => s.setAdmin);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login({ phone, password });
      setTokens(data.access, data.refresh);
      const me = await authApi.me();
      setAdmin(me.user);
      if (!me.user.is_staff) {
        setTokens("", "");
        setError("Bu akkaunt admin emas");
        return;
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Admin panelga kirish">
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
            <ShieldCheck className="h-4 w-4" /> Kirish
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}