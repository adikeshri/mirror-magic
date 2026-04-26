import { useEffect, useState } from "react";
// @ts-expect-error - ical.js has no bundled types
import ICAL from "ical.js";
import { CalendarEvent } from "./types";

const REMINDER_RE = /\b(todo|reminder)\b|\[reminder\]/i;

// Public CORS proxy for raw iCal fetches. Users can paste their own ical URL.
function viaProxy(url: string): string {
  if (!url) return url;
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
}

export function useCalendar(icalUrl: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!icalUrl) {
      setEvents([]);
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(viaProxy(icalUrl));
        const text = await res.text();
        const jcal = ICAL.parse(text);
        const comp = new ICAL.Component(jcal);
        const vevents = comp.getAllSubcomponents("vevent");
        const now = new Date();
        const horizon = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60); // 60 days
        const out: CalendarEvent[] = [];

        for (const v of vevents) {
          const e = new ICAL.Event(v);
          if (e.isRecurring()) {
            const it = e.iterator();
            let next;
            // emit up to next 5 occurrences within horizon
            let emitted = 0;
            while ((next = it.next()) && emitted < 5) {
              const occ = e.getOccurrenceDetails(next);
              const start = occ.startDate.toJSDate();
              if (start > horizon) break;
              if (start.getTime() + 1000 * 60 * 60 * 24 < now.getTime()) continue;
              out.push({
                uid: `${e.uid}-${start.getTime()}`,
                title: e.summary || "(untitled)",
                start,
                end: occ.endDate.toJSDate(),
                isReminder: REMINDER_RE.test(e.summary || ""),
                allDay: occ.startDate.isDate,
              });
              emitted++;
            }
          } else {
            const start = e.startDate.toJSDate();
            if (start > horizon) continue;
            if (start.getTime() + 1000 * 60 * 60 * 24 < now.getTime()) continue;
            out.push({
              uid: e.uid,
              title: e.summary || "(untitled)",
              start,
              end: e.endDate.toJSDate(),
              isReminder: REMINDER_RE.test(e.summary || ""),
              allDay: e.startDate.isDate,
            });
          }
        }

        out.sort((a, b) => a.start.getTime() - b.start.getTime());
        if (!cancelled) {
          setEvents(out);
          setError(null);
        }
      } catch (e) {
        console.error("[mirror] calendar load failed", e);
        if (!cancelled) setError("Could not load calendar");
      }
    };

    load();
    const id = setInterval(load, 1000 * 60 * 5);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [icalUrl]);

  return { events, error };
}
