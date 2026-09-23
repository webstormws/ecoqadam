import { useCallback, useEffect, useState } from "react";

export interface GeoState {
  state: "idle" | "detecting" | "done" | "denied" | "error";
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error?: string;
  locate: () => Promise<{ lat: number; lng: number; accuracy: number } | null>;
}

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState["state"]>("idle");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string>();

  const locate = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setState("error");
      setError("GPS xizmati qurilmada mavjud emas.");
      return null;
    }
    setState("detecting");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      );
      const coords = pos.coords;
      setLat(coords.latitude);
      setLng(coords.longitude);
      setAccuracy(coords.accuracy ?? null);
      setState("done");
      return { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy ?? null };
    } catch (err) {
      const message =
        (err as { message?: string })?.message ?? "";
      if (message.toLowerCase().includes("denied") || message.toLowerCase().includes("permiss")) {
        setState("denied");
        setError("Lokatsiya ruxsati berilmadi. Qurilma sozlamalaridan ruxsat bering.");
      } else {
        setState("error");
        setError("Joylashuv aniqlanmadi. Qayta urinib ko'ring.");
      }
      return null;
    }
  }, []);

  useEffect(() => {
    void locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, lat, lng, accuracy, error, locate };
}