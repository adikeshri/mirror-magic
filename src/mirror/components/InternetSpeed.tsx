import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { apiUrl } from "../fetchJson";

// Downloads a few MB (relayed by Mira) to time it, so it runs rarely and the
// module is off by default.
const TEST_URL = "/api/network/speed-test";
const TIMEOUT_MS = 15_000;
const INTERVAL_MS = 30 * 60 * 1000;

async function measureMbps(): Promise<number | null> {
  const start = performance.now();
  const r = await fetch(apiUrl(`${TEST_URL}?_=${Date.now()}`), { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!r.ok) return null;
  const bytes = (await r.arrayBuffer()).byteLength;
  const seconds = (performance.now() - start) / 1000;
  return bytes > 0 && seconds > 0 ? (bytes * 8) / seconds / 1e6 : null;
}

export function InternetSpeed() {
  const [online, setOnline] = useState(navigator.onLine);
  const [mbps, setMbps] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      setOnline(navigator.onLine);
      if (!navigator.onLine) return;
      measureMbps()
        .catch(() => null)
        .then((v) => !cancelled && setMbps(v));
    };
    const offline = () => setOnline(false);
    run();
    const id = window.setInterval(run, INTERVAL_MS);
    window.addEventListener("online", run);
    window.addEventListener("offline", offline);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("online", run);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const Icon = online ? Wifi : WifiOff;
  return (
    <p className="inline-flex items-center gap-[0.4em] text-dim" style={{ fontSize: "1rem" }}>
      <Icon size="1em" strokeWidth={1.5} aria-hidden />
      {!online ? "Offline" : mbps != null ? `${mbps.toFixed(0)} Mbps` : "Measuring…"}
    </p>
  );
}
