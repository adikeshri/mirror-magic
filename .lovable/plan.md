# Magic Mirror UI for Aditya

A pure-black fullscreen dashboard styled like the original MagicMirror², designed to display behind a two-way mirror. White thin typography, no chrome, no scrollbars.

## Layout

```text
┌─────────────────────────────────────────────────────────┐
│ TOP-LEFT                              TOP-RIGHT         │
│ Good morning, Aditya                  72° Partly Cloudy │
│ 7:42                                  ☀ icon            │
│ Friday, April 26                      AQI 38 · Good     │
│ Week 17                               Mon 75°/58°       │
│                                       Tue 70°/55° …     │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                  BOTTOM-CENTER                          │
│         ─── rotating news / quote ticker ───            │
│           "BBC: ..." · fades to next every 12s          │
└─────────────────────────────────────────────────────────┘
```

Calendar + reminders sit under the clock in the top-left (same column), since left corner is the natural reading anchor.

## Modules

**Top-left column**
- Personalized greeting: "Good morning/afternoon/evening, Aditya" — changes by hour
- Large clock (HH:MM, blinking colon, 24h toggle in settings), seconds in smaller weight
- Full date + week number
- Calendar/agenda: next 5 upcoming events from your iCal feed (time, title, relative day like "Today", "Tomorrow", "Sat")
- Reminders: events from the same iCal whose title contains `TODO` or `[reminder]`, shown as a checklist

**Top-right column**
- Current temperature (huge), condition text, weather icon
- AQI value + color-coded label (Good / Moderate / Unhealthy …)
- Sunrise/sunset times
- 5-day forecast: day abbrev, icon, high/low

**Bottom-center**
- Rotating ticker that alternates between BBC World News headlines (RSS) and inspirational quotes
- Each item fades in/out every ~12s, max one line, centered

## Personalization

- Greeting name: **Aditya** (hardcoded, editable in a settings file)
- Weather location: **browser geolocation** on load, with a fallback prompt if denied
- Calendar/reminders: **iCal URL** — you'll paste it into a hidden settings panel (open with `Shift + S` or a tiny gear icon in the corner that's invisible until hovered). Stored in localStorage.

## Style

- Background: pure `#000000` (so the mirror reflection stays clean)
- Text: white, thin weights (Roboto 100/200/300 from Google Fonts)
- Huge clock (~10rem, weight 100), section labels small uppercase tracked-out
- Subtle fade-in animations on data updates
- No borders, no cards, no shadows — just text floating on black
- Generous padding from screen edges (~3rem) so nothing gets clipped by the mirror frame

## Data sources (all free, no keys needed for v1)

- **Weather + AQI + forecast**: Open-Meteo API (free, no key, returns weather + air-quality in one call)
- **News**: BBC World RSS via a CORS-friendly proxy (`rss2json.com` free tier) — refreshes every 10 min
- **Quotes**: bundled local list of ~50 quotes, rotates randomly
- **Calendar**: fetch the iCal URL directly, parse with `ical.js`, refresh every 5 min

## Settings panel (hidden)

Opens with `Shift + S`. Contains:
- iCal URL input
- Toggle: 24h vs 12h clock
- Toggle: temperature units (°F / °C)
- Manual city override (if geolocation denied)
- All saved to localStorage, no backend needed

## Technical notes

- Single page, replaces `src/pages/Index.tsx`
- New components: `Clock.tsx`, `Greeting.tsx`, `Weather.tsx`, `Forecast.tsx`, `AQI.tsx`, `Calendar.tsx`, `Reminders.tsx`, `Ticker.tsx`, `SettingsPanel.tsx`
- Hooks: `useClock`, `useWeather`, `useCalendar`, `useNews`, `useGeolocation`, `useSettings` (localStorage)
- Add Roboto thin font via `<link>` in `index.html`
- `index.css` updated: black background app-wide for the mirror route, thin font defaults
- No backend / no Lovable Cloud needed for v1 — all client-side fetches

## Out of scope for v1

- Voice control / wake words
- Face recognition
- Multi-user profiles
- Spotify / smart-home integrations

These can be added later if you want.