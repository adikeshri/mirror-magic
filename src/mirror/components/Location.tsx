import { MapPin } from "lucide-react";
import { Coords } from "../types";

export function Location({
  coords,
  city,
}: {
  coords: Coords | null;
  city: string | null;
}) {
  if (!coords) return null;

  const label = city ?? `${coords.lat.toFixed(2)}°, ${coords.lon.toFixed(2)}°`;

  return (
    <div className="flex items-center gap-1.5 text-dim light text-sm fade-in-text mt-1">
      <MapPin size={13} strokeWidth={1.5} className="text-faint" />
      <span>{label}</span>
    </div>
  );
}
