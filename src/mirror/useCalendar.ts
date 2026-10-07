import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetchJson";
import type { CalendarEvent } from "./components/Calendar";

export type EventStatus = "past" | "now" | "upcoming";

// All-day events are "now" for the whole day: Mira only returns them on the days they cover.
export function statusOf(e: CalendarEvent, now: Date): EventStatus {
  if (e.allDay) return "now";
  return e.end <= now ? "past" : e.start <= now ? "now" : "upcoming";
}


type Wire = { title: string; calendar: string; start: string; end: string; allDay: boolean; location: string | null; source: number };

const REFRESH_MS = 5 * 60 * 1000;

// Mira merges the iCal URLs in its config.json and returns today's events only.
export function useCalendar(enabled: boolean): CalendarEvent[] {
  return (
    useQuery({
      queryKey: ["calendar"],
      queryFn: async () =>
        (await fetchJson<Wire[]>("/api/calendar", 30_000)).map((w) => ({
          title: w.title,
          calendar: w.calendar,
          start: new Date(w.start),
          end: new Date(w.end),
          allDay: w.allDay,
          source: w.source ?? 0, // an older Mira build sends no source
        })),
      enabled,
      refetchInterval: REFRESH_MS,
      staleTime: REFRESH_MS,
    }).data ?? []
  );
}
