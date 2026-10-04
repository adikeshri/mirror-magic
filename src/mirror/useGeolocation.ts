import { useEffect, useState } from "react";
import { Coords, Settings } from "./config";

// Configured location wins; otherwise ask the browser (needs https or localhost).
export function useGeolocation(location: Settings["location"]) {
  const [browserCoords, setBrowserCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location) return;
    if (!("geolocation" in navigator)) {
      setError("Geolocation unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setBrowserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: false, maximumAge: 60 * 60 * 1000, timeout: 15_000 },
    );
  }, [location]);

  return { coords: location ?? browserCoords, error: location ? null : error };
}
