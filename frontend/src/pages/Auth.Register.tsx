import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { authApi } from "@/api/endpoints";
import { errorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { AuthShell } from "@/components/AuthShell";
import { Button, Field } from "@/components/ui";
import TelegramLoginButton from "@/components/TelegramLoginButton";

export default function Register() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [form, setForm] = useState({ phone: "", first_name: "", last_name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authApi.register({ ...form });
      setTokens(data.access, data.refresh);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Ariza yuboring, mukofot oling">
      <form
        className="bg-surface rounded-card shadow-card p-6 animate-fade-up"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="space-y-4">
          <Field label="Ism" placeholder="Aziz" value={form.first_name} onChange={set("first_name")} required />
          <Field label="Familiya" placeholder="Karimov" value={form.last_name} onChange={set("last_name")} />
          <Field
            label="Telefon raqami"
            type="tel"
            inputMode="tel"
            placeholder="+998 __ ___ __ __"
            value={form.phone}
            onChange={set("phone")}
            required
          />
          <Field
            label="Parol (kamida 6 belgi)"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set("password")}
            required
            minLength={6}
          />
          {error && <p className="text-danger text-[13px] font-medium">{error}</p>}
          <Button type="submit" loading={loading}>
            <UserPlus className="h-4 w-4" /> Ro'yxatdan o'tish
          </Button>
          <TelegramLoginButton />
        </div>
        <p className="text-center text-[13px] text-muted mt-5">
          Akkauntingiz bormi?{" "}
          <Link to="/login" className="font-semibold text-primary-deeper">
            Kirish
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}