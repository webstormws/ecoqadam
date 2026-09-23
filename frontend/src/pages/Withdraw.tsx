import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Info, Send } from "lucide-react";
import { walletApi, withdrawalApi } from "@/api/endpoints";
import { errorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { useData } from "@/hooks/useData";
import { Screen, Button, Field } from "@/components/ui";
import { fmt } from "@/api/types";

const MIN = 50000;

export default function Withdraw() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.profile?.user);
  const balance = useData(() => walletApi.balance());

  const [amount, setAmount] = useState("");
  const [card, setCard] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bal = balance.data?.balance ?? user?.balance ?? 0;
  const canSubmit = !sending && !!amount && !!card;

  const quickAmounts = [50000, 100000, 200000].filter((a) => a <= bal);

  const submit = async () => {
    setSending(true);
    setError("");
    try {
      await withdrawalApi.create({
        amount: Number(amount),
        card_number: card,
      });
      toast.success("Ariza qabul qilindi. Admin tasdiqlaydi.");
      navigate("/balance", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen className="pb-8">
      <header className="flex items-center gap-3 py-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface shadow-card grid place-items-center text-ink">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[22px] font-extrabold text-ink">Pul yechib olish</h1>
      </header>

      <div className="bg-surface rounded-card shadow-card p-5">
        <p className="text-[13px] text-muted font-medium">Balans</p>
        <p className="text-[26px] font-extrabold text-ink mt-1">{fmt(bal)}</p>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <span className="block text-sm font-semibold text-ink mb-2">Summa</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={String(MIN)}
            className="w-full h-14 rounded-card bg-surface shadow-card px-4 text-[18px] font-bold text-ink placeholder:text-muted/50"
          />
          {quickAmounts.length > 0 && (
            <div className="flex gap-2 mt-2.5">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`px-3.5 py-2 rounded-pill text-[12px] font-semibold transition-all active:scale-95 ${
                    String(a) === amount ? "bg-primary text-white" : "bg-surface shadow-card text-ink"
                  }`}
                >
                  {fmt(a)}
                </button>
              ))}
            </div>
          )}
        </div>

        <Field
          label="Karta raqami"
          placeholder="8600 1234 5678 9012"
          inputMode="numeric"
          value={card}
          onChange={(e) => setCard(e.target.value.replace(/[^\d\s]/g, ""))}
          className="!h-14"
        />

        <div className="flex items-start gap-2.5 text-muted text-[12px] leading-relaxed">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Minimal yechib olish summasi {fmt(MIN)}. To'lov admin tasdiqlaganidan keyin amalga oshiriladi.
            Bir vaqtning o'zida faqat bitta kutilayotgan ariza bo'lishi mumkin.
          </p>
        </div>

        {error && <p className="text-danger text-[13px] font-medium">{error}</p>}

        <Button loading={sending} disabled={!canSubmit} onClick={submit}>
          <Send className="h-4 w-4" /> Pul yechish so'rovini yuborish
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[12px] text-muted">
          <CreditCard className="h-3.5 w-3.5" /> Karta ma'lumotlari faqat admin ko'radi
        </p>
      </div>
    </Screen>
  );
}