import { useEffect, useState } from "react";
import { Settings as SettingsIcon, X } from "lucide-react";
import { Settings } from "../types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
};

export function SettingsPanel({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "S" || e.key === "s")) {
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        aria-label="Open settings"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 w-8 h-8 rounded-full text-faint hover:text-bright opacity-20 hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <SettingsIcon size={16} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-popover border border-border rounded-md p-6 w-full max-w-md text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="light text-lg">Mirror Settings</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} className="text-dim hover:text-bright" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="label-xs">Your name</Label>
                <Input
                  value={settings.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  className="mt-1 bg-input border-border"
                />
              </div>

              <div>
                <Label className="label-xs">iCal feed URL</Label>
                <Input
                  value={settings.icalUrl}
                  onChange={(e) => onChange({ icalUrl: e.target.value })}
                  placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                  className="mt-1 bg-input border-border"
                />
                <p className="text-faint text-xs mt-1 light">
                  Events with "TODO" or "[reminder]" in the title appear as reminders.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label className="label-xs">24-hour clock</Label>
                <Switch
                  checked={settings.use24h}
                  onCheckedChange={(v) => onChange({ use24h: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="label-xs">Use Celsius</Label>
                <Switch
                  checked={settings.unit === "celsius"}
                  onCheckedChange={(v) => onChange({ unit: v ? "celsius" : "fahrenheit" })}
                />
              </div>

              <div>
                <Label className="label-xs">Manual location (if geolocation denied)</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Input
                    placeholder="City"
                    value={settings.manualCity ?? ""}
                    onChange={(e) => onChange({ manualCity: e.target.value })}
                    className="bg-input border-border"
                  />
                  <Input
                    placeholder="Lat"
                    inputMode="decimal"
                    value={settings.manualLat ?? ""}
                    onChange={(e) =>
                      onChange({ manualLat: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="bg-input border-border"
                  />
                  <Input
                    placeholder="Lon"
                    inputMode="decimal"
                    value={settings.manualLon ?? ""}
                    onChange={(e) =>
                      onChange({ manualLon: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <p className="text-faint text-xs light pt-2">
                Tip: press <kbd className="text-bright">Shift + S</kbd> anytime to toggle this panel.
              </p>

              <Button onClick={() => setOpen(false)} variant="secondary" className="w-full">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
