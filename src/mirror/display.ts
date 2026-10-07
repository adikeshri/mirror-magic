import { useEffect, useState } from "react";

export type LayoutSetting = "auto" | "portrait" | "landscape";

// "auto" follows the screen's shape; the other two force that arrangement whatever the screen says.
export function resolveLayout(setting: LayoutSetting, screenIsLandscape: boolean): "portrait" | "landscape" {
  return setting === "auto" ? (screenIsLandscape ? "landscape" : "portrait") : setting;
}

// Night is from sunset to sunrise. The times are the location's wall-clock times (as Open-Meteo returns
// them), compared with the device's clock, so this assumes the mirror is in the time zone it reports for.
export function isNight(now: Date, sunrise: string, sunset: string): boolean {
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  if (Number.isNaN(rise) || Number.isNaN(set)) return false; // no usable times: never dim by mistake
  const t = now.getTime();
  return t < rise || t >= set;
}

export function useScreenIsLandscape(): boolean {
  const query = "(orientation: landscape)";
  const [landscape, setLandscape] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setLandscape(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return landscape;
}
