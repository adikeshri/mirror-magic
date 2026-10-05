import { useEffect, useRef, useState, type FormEvent } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import type { ModuleName, Overrides, Settings } from "../config";

const MODULE_LABELS: Record<ModuleName, string> = {
  greeting: "Greeting",
  clock: "Clock",
  weather: "Weather",
  forecast: "Forecast",
  markets: "Markets",
  news: "Headlines",
  quote: "Quote",
  commute: "Commute",
  onThisDay: "On this day",
  network: "Internet speed",
};

type Props = {
  settings: Settings;
  onChange: (patch: Overrides) => void;
  onReset: () => void;
};

const field = "mt-1 w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-bright outline-none focus:border-white/50";

// Hidden settings: Shift + S, or the near-invisible gear in the corner.
// Changes are saved on this device only; config.json holds the defaults.
export function SettingsPanel({ settings, onChange, onReset }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [place, setPlace] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);

  const open = () => {
    setLat(settings.location ? String(settings.location.lat) : "");
    setLon(settings.location ? String(settings.location.lon) : "");
    setPlace(settings.location?.name ?? "");
    setLocationError(null);
    dialog.current?.showModal();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.key.toLowerCase() !== "s") return;
      if (e.target instanceof HTMLInputElement) return; // typing a capital S
      if (dialog.current?.open) dialog.current.close();
      else open();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const saveLocation = (e: FormEvent) => {
    e.preventDefault();
    const la = Number(lat);
    const lo = Number(lon);
    if (lat.trim() === "" || lon.trim() === "" || !(Math.abs(la) <= 90) || !(Math.abs(lo) <= 180)) {
      setLocationError("Latitude must be -90 to 90 and longitude -180 to 180.");
      return;
    }
    setLocationError(null);
    onChange({ location: { lat: la, lon: lo, name: place.trim() || undefined } });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open settings"
        onClick={open}
        className="fixed bottom-2 right-2 grid size-8 place-items-center text-faint opacity-10 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        <SettingsIcon size={16} strokeWidth={1.5} />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="settings-title"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="w-[min(32rem,92vw)] rounded-lg border border-white/15 bg-neutral-950 p-0 text-[15px] text-normal backdrop:bg-black/80"
      >
        <div className="max-h-[85vh] space-y-6 overflow-y-auto p-6">
          <header className="flex items-baseline justify-between">
            <h2 id="settings-title" className="text-lg text-bright">
              Mirror settings
            </h2>
            <span className="text-xs text-faint">Saved on this device</span>
          </header>

          <label className="block">
            <span className="text-sm text-dim">Your name</span>
            <input
              className={field}
              value={settings.name}
              maxLength={40}
              autoComplete="off"
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={settings.hour24} onChange={(e) => onChange({ hour24: e.target.checked })} />
              24-hour clock
            </label>
            <label className="flex items-center gap-2">
              <span className="text-dim">Units</span>
              <select
                className="rounded border border-white/15 bg-neutral-900 px-2 py-1 text-bright"
                value={settings.units}
                onChange={(e) => onChange({ units: e.target.value as Settings["units"] })}
              >
                <option value="metric">Metric (°C)</option>
                <option value="imperial">Imperial (°F)</option>
              </select>
            </label>
          </div>

          <form onSubmit={saveLocation} className="space-y-2">
            <span className="text-sm text-dim">
              Location {settings.location ? "" : "(using this device's location)"}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input className={field} placeholder="Latitude" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
              <input className={field} placeholder="Longitude" inputMode="decimal" value={lon} onChange={(e) => setLon(e.target.value)} />
              <input className={field} placeholder="Name (optional)" maxLength={80} value={place} onChange={(e) => setPlace(e.target.value)} />
            </div>
            {locationError && <p className="text-sm text-down">{locationError}</p>}
            <div className="flex gap-2">
              <button type="submit" className="rounded border border-white/20 px-3 py-1.5 text-bright hover:bg-white/10">
                Save location
              </button>
              {settings.location && (
                <button
                  type="button"
                  className="rounded px-3 py-1.5 text-dim hover:text-bright"
                  onClick={() => onChange({ location: null })}
                >
                  Use device location
                </button>
              )}
            </div>
          </form>

          <fieldset>
            <legend className="mb-2 text-sm text-dim">Modules</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(Object.keys(MODULE_LABELS) as ModuleName[]).map((m) => (
                <label key={m} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.modules[m]}
                    onChange={(e) => onChange({ modules: { [m]: e.target.checked } })}
                  />
                  {MODULE_LABELS[m]}
                </label>
              ))}
            </div>
          </fieldset>

          <p className="text-xs text-faint">
            Markets, news feeds and locale are set in <code className="text-dim">config.json</code>. Press{" "}
            <kbd className="text-dim">Shift + S</kbd> to toggle this panel.
          </p>

          <footer className="flex justify-between">
            <button
              type="button"
              className="rounded px-3 py-1.5 text-dim hover:text-bright"
              onClick={() => {
                onReset();
                dialog.current?.close();
              }}
            >
              Reset to config.json
            </button>
            <button
              type="button"
              autoFocus
              className="rounded bg-white/90 px-4 py-1.5 text-black hover:bg-white"
              onClick={() => dialog.current?.close()}
            >
              Done
            </button>
          </footer>
        </div>
      </dialog>
    </>
  );
}
