import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Coords, Settings } from "./config";
import { fetchJson, num } from "./fetchJson";

// A permission prompt nobody answers never fails, so don't wait on it forever.
const BROWSER_PATIENCE_MS = 12_000;

async function loadIpLocation(): Promise<Coords> {
  const j = await fetchJson<{ lat?: unknown; lon?: unknown; name?: unknown }>("/api/location", 15_000);
  const lat = num(j.lat);
  const lon = num(j.lon);
  if (lat == null || lon == null) throw new Error("bad location response");
  return { lat, lon, name: typeof j.name === "string" && j.name ? j.name : undefined };
}

// Where the mirror is, in order of preference:
//   1. the location set in config.json or the settings panel
//   2. the browser's geolocation (needs https or localhost, and many kiosk
//      browsers, Chromium on a Pi included, can't provide it)
//   3. an estimate from the server's IP (works headless, but only city-level)
// The IP lookup starts once the browser has failed or kept us waiting, and a
// browser fix that arrives later still wins.
export function useGeolocation(location: Settings["location"], auto: boolean) {
  const [browser, setBrowser] = useState<Coords | null>(null);
  const [browserFailed, setBrowserFailed] = useState(false);
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    if (location) return;
    setBrowserFailed(false);
    setWaited(false);
    if (!("geolocation" in navigator)) {
      setBrowserFailed(true);
      return;
    }
    const timer = window.setTimeout(() => setWaited(true), BROWSER_PATIENCE_MS);
    navigator.geolocation.getCurrentPosition(
      (pos) => setBrowser({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setBrowserFailed(true),
      { enableHighAccuracy: false, maximumAge: 60 * 60 * 1000, timeout: 15_000 },
    );
    return () => window.clearTimeout(timer);
  }, [location]);

  const ip = useQuery({
    queryKey: ["ip-location"],
    queryFn: loadIpLocation,
    enabled: !location && auto && !browser && (browserFailed || waited),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  if (location) return { coords: location, error: null };
  if (browser) return { coords: browser, error: null };
  if (ip.data) return { coords: ip.data, error: null };
  const gaveUp = browserFailed && (!auto || ip.isError);
  return { coords: null, error: gaveUp ? "Location unavailable" : null };
}
