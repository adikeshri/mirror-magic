import { useEffect, useState } from "react";
import { Coords, Settings } from "./types";

export function useGeolocation(settings: Settings) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.manualLat != null && settings.manualLon != null) {
      setCoords({ lat: settings.manualLat, lon: settings.manualLon, city: settings.manualCity });
      return;
    }
    if (!("geolocation" in navigator)) {
      setError("Geolocation unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 60, timeout: 10000 }
    );
  }, [settings.manualLat, settings.manualLon, settings.manualCity]);

  return { coords, error };
}
