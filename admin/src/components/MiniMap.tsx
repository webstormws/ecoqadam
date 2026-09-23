import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

export function MiniMap({ lat, lng, interactive = false }: { lat: number; lng: number; interactive?: boolean }) {
  const icon = useMemo(() => pin("#2563EB"), []);
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      attributionControl={false}
      style={{ borderRadius: 18 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={icon} />
    </MapContainer>
  );
}