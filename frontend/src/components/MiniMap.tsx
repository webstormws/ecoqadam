import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapReport, ReportStatus } from "@/api/types";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const colorFor: Record<ReportStatus, string> = {
  APPROVED: "#16A34A",
  PENDING: "#F59E0B",
  REJECTED: "#EF4444",
};

function pin(color: string) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        background:${color};border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.25);
      "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 24],
  });
}

interface MiniMapProps {
  lat: number;
  lng: number;
  markers?: MapReport[];
  interactive?: boolean;
  onMarker?: (r: MapReport) => void;
}

export function MiniMap({ lat, lng, markers, interactive = false, onMarker }: MiniMapProps) {
  const hasMarkers = Array.isArray(markers) && markers.length > 0;
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={hasMarkers ? 13 : 15}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      attributionControl={false}
      style={{ borderRadius: 18 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers?.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={pin(colorFor[m.status])}
          eventHandlers={onMarker ? { click: () => onMarker(m) } : undefined}
        >
          <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
            {m.status === "APPROVED" ? `+${m.reward_amount} so'm` : m.status}
          </Tooltip>
        </Marker>
      ))}
      <Marker position={[lat, lng]} icon={pin("#2563EB")} />
    </MapContainer>
  );
}