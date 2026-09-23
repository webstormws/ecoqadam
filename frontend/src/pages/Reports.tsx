import { useNavigate } from "react-router-dom";
import { Leaf, PlusCircle } from "lucide-react";
import { reportsApi } from "@/api/endpoints";
import { useData } from "@/hooks/useData";
import { Screen, Title, Subtitle, Button, Card, Skeleton, EmptyState } from "@/components/ui";
import { ReportCard } from "@/components/cards";
import { fmt } from "@/api/types";

export default function Reports() {
  const navigate = useNavigate();
  const { data, loading } = useData(() => reportsApi.list());
  const summary = data?.summary;

  return (
    <Screen>
      <header className="pt-4 pb-5">
        <Title>Xabarlarim</Title>
        <Subtitle className="mt-1">
          {summary ? `${summary.total} ta ariza — ${fmt(summary.earned)} ishlab topildi` : "Arizalaringiz tarixi"}
        </Subtitle>
      </header>

      {summary && (
        <Card className="mb-5 grid grid-cols-4 gap-2 !p-4">
          {[
            { label: "Jami", value: summary.total, tone: "text-ink" },
            { label: "Ko'rib chiqilmoqda", value: summary.pending, tone: "text-warn" },
            { label: "Tasdiqlandi", value: summary.approved, tone: "text-primary-deeper" },
            { label: "Rad etildi", value: summary.rejected, tone: "text-danger" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-[18px] font-extrabold ${s.tone}`}>{s.value}</p>
              <p className="text-[10px] text-muted leading-tight mt-0.5">{s.label}</p>
            </div>
          ))}
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface rounded-card shadow-card p-3.5 flex gap-3">
              <Skeleton className="w-[84px] h-[84px]" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (data?.results.length ?? 0) === 0 ? (
        <Card>
          <EmptyState
            icon={<Leaf className="h-8 w-8" />}
            title="Hozircha arizalar yo'q"
            text="Chiqindi ko'rsangiz, darhol xabar bering"
          />
          <Button onClick={() => navigate("/submit")}>
            <PlusCircle className="h-5 w-5" /> Xabar berish
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.results.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </Screen>
  );
}