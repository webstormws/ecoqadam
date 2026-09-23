import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authApi } from "@/api/endpoints";
import { errorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { AuthShell } from "@/components/AuthShell";

/** /auth/telegram?token=... — exchanged here for JWT tokens. */
export default function TelegramCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Havola noto'g'ri. Telegram botdan yana urinib ko'ring.");
      return;
    }
    (async () => {
      try {
        const data = await authApi.telegramVerify(token);
        setTokens(data.access, data.refresh);
        const me = await authApi.me();
        setProfile(me);
        navigate("/", { replace: true });
      } catch (err) {
        setError(errorMessage(err));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthShell>
      {error ? (
        <p className="text-danger text-center font-semibold animate-fade-up">{error}</p>
      ) : (
        <div className="flex flex-col items-center animate-fade-up">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted text-sm mt-3">Telegram orqali kirilmoqda…</p>
        </div>
      )}
    </AuthShell>
  );
}