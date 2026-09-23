import { useNavigate } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { walletApi } from "@/api/endpoints";
import { useData } from "@/hooks/useData";
import { Screen, Title, Subtitle, Button, Skeleton, EmptyState } from "@/components/ui";
import { TransactionListItem } from "@/components/cards";
import { fmt } from "@/api/types";

export default function Balance() {
  const navigate = useNavigate();
  const balance = useData(() => walletApi.balance());
  const txs = useData(() => walletApi.transactions());

  return (
    <Screen className="pb-8">
      <header className="pt-4 pb-5">
        <Title>Balans</Title>
        <Subtitle className="mt-1">Mukofotlaringiz va to'lovlar tarixi</Subtitle>
      </header>

      {/* Balance card */}
      <div className="relative overflow-hidden bg-ink rounded-[28px] p-6 shadow-card">
        <div className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-16 w-24 h-24 rounded-full bg-white/5" />
        <div className="flex items-center gap-2 text-white/70 text-[13px] font-medium">
          <Wallet className="h-4 w-4" /> Joriy balans
        </div>
        <p className="text-white text-[34px] font-extrabold mt-3 leading-none">
          {balance.loading ? "…" : fmt(balance.data?.balance ?? 0)}
        </p>
        {!balance.loading && balance.data && balance.data.pending_withdrawal > 0 && (
          <p className="text-amber-300/90 text-[12px] font-medium mt-2">
            {balance.data.pending_withdrawal} ta yechib olish arizasi ko'rib chiqilmoqda
          </p>
        )}

        <Button full className="mt-6 !bg-white !text-ink !shadow-none" onClick={() => navigate("/withdraw")}>
          Pul yechish <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* History */}
      <div className="mt-7">
        <h2 className="text-[15px] font-bold text-ink mb-3">Tranzaksiyalar tarixi</h2>

        {txs.loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (txs.data?.results.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Wallet className="h-8 w-8" />}
            title="Tranzaksiyalar yo'q"
            text="Chiqindi haqida xabar bering va birinchi mukofotingizni oling"
          />
        ) : (
          txs.data?.results.map((t) => (
            <TransactionListItem key={t.id} amount={t.amount} note={t.note} createdAt={t.created_at} />
          ))
        )}
      </div>
    </Screen>
  );
}