import { useState } from "react";
import { MapPin } from "lucide-react";
import { reportsApi } from "@/api/endpoints";
import { useData } from "@/hooks/useData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Skeleton, StatusChip } from "@/components/ui";
import { MiniMap } from "@/components/MiniMap";
import type { MapReport } from "@/api/types";
import { fmt } from "@/api/types";

export default function MapScreen() {
  const geo = useGeolocation();
  const { data, loading } = useData(() => reportsApi.map());
  const [selected, setSelected] = useState<MapReport | null>(null);

  const markers = data?.results ?? [];

  // fallback view center
  const centerLat = selected?.latitude ?? geo.lat ?? 41.311081;
  const centerLng = selected?.longitude ?? geo.lng ?? 69.240562;

  return (
    <div className="relative h-[100dvh]">
      <header className="absolute top-0 left-0 right-0 z-[800]">
        <div className="app-frame">
          <div className="px-5 pt-safe flex items-center justify-between">
            <h1 className="text-[22px] font-extrabold text-ink pt-4 pb-3 drop-shadow-sm">Xarita</h1>
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur rounded-pill px-3 py-1.5 shadow-card mt-4">
              <MapPin className="h-4 w-4 text-primary-deeper" />
              <span className="text-[12px] font-semibold text-ink">{markers.length} ta ariza</span>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="app-frame h-full">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      ) : (
        <div className="app-frame h-full">
          <MiniMap
            lat={centerLat}
            lng={centerLng}
            markers={markers}
            interactive
            onMarker={(m) => {
              setSelected(m);
            }}
          />
        </div>
      )}

      {/* Marker bottom sheet */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 z-[850]">
          <div className="app-frame">
            <div className="mx-4 mb-4 bg-surface rounded-card shadow-card p-4 animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <p className="font-extrabold text-ink">Chiqindi #{selected.id}</p>
                <button onClick={() => setSelected(null)} className="text-muted text-[13px] font-semibold">
                  Yopish
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <StatusChip status={selected.status} label={selected.status} />
                {selected.status === "APPROVED" && selected.reward_amount > 0 && (
                  <span className="text-primary-deeper font-extrabold text-[14px]">+ {fmt(selected.reward_amount)}</span>
                )}
              </div>
              <p className="text-[12px] text-muted mt-2">
                {new Date(selected.created_at).toLocaleString("uz-UZ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}