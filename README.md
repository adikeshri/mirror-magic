# Mirror Magic

A minimal, self-hosted smart mirror dashboard. Put a monitor behind two-way
glass, point a browser at it, and you get the time, weather, markets, headlines
and a quote, as thin white text on pure black, so the mirror still reflects.

- **No accounts, no API keys.** Every data source is free and keyless.
- **One backend: [Mira](https://github.com/adikeshri/mira).** The browser calls
  Mira directly. It fetches, caches and tidies every data source, and can serve
  this app too, so a single process runs the whole mirror.
- **Configured with one JSON file**, plus an on-screen settings panel.
- **Built for a mirror.** It scales to any screen and works in portrait or
  landscape. The centre stays clear for your reflection, the layout drifts a
  few pixels to prevent burn-in, and the cursor hides itself.

## Quick start

Requires Node.js 22.18+ (to build) and the .NET 9 SDK (to run Mira).

```bash
git clone https://github.com/adikeshri/mirror-magic.git
git clone https://github.com/adikeshri/mira.git
cd mirror-magic && npm ci && npm run build && cd ../mira
cp config.example.json config.json   # then edit it
Mira__UiPath=$PWD/../mirror-magic/dist dotnet run --project src/Mira.Api   # http://127.0.0.1:5080
```

Mira serves the built app and the API from the same address. For development with
hot reload, run Mira, then `VITE_MIRA_URL=http://127.0.0.1:5080 npm run dev`
(http://127.0.0.1:8080; Mira allows that origin via CORS).

## Configuration

Settings are layered, each overriding the one before:

1. Built-in defaults ([`src/mirror/config.ts`](src/mirror/config.ts))
2. `config.json` in Mira, for this mirror's setup (see Mira's
   `config.example.json`). The mirror reads it through `/api/config`.
3. The settings panel (**Shift + S**, or the faint gear in the bottom-right
   corner). Changes are saved in the browser on that device, and
   "Reset to config.json" clears them.

Every field is validated on its own. A typo in one field falls back to that
field's default, and the rest of the mirror keeps running.

| Field | Default | Notes |
| --- | --- | --- |
| `name` | `""` | Used in the greeting. Empty means just "Good morning". |
| `locale` | `""` | BCP 47 tag such as `en-GB` or `hi-IN`. Empty uses the browser's locale. |
| `hour24` | `false` | 24-hour clock. |
| `units` | `"metric"` | `"metric"` (°C, km/h) or `"imperial"` (°F, mph). |
| `location` | `null` | `{ "lat": 51.5, "lon": -0.12, "name": "London" }`. The most accurate option, so set it if you can. `name` is optional and is looked up if missing. |
| `autoLocation` | `true` | Last resort when `location` is `null` and the browser can't provide one: estimate the location from this machine's public IP (city-level, can be off by tens of km). The order is `location`, then the browser's own location (needs `https` or `localhost` and often doesn't work on a Pi), then the IP estimate. Set `false` to never send your IP to a lookup service. |
| `modules.*` | all on, except `network` | Show or hide `greeting`, `clock`, `weather`, `forecast`, `markets`, `news`, `quote`, `onThisDay` and `network` (internet speed). |
| `markets.crypto` | BTC, ETH | `[{ "id": "<CoinGecko id>", "label": "BTC" }]` |
| `markets.cryptoCurrency` | `"usd"` | Currency the crypto prices are quoted in. |
| `markets.fx` | EUR/USD | `[{ "from": "USD", "to": "INR", "label": "USD ₹" }]`, from ECB rates. |
| `markets.indices` | S&P 500 | `[{ "symbol": "^NSEI", "label": "NIFTY 50" }]`, using Yahoo Finance symbols. |
| `news.local` | none | Same shape as `news.feeds` (up to 5), shown under the world headlines in the same Headlines section. Empty means world only. |
| `news.feeds` | BBC, Guardian, Al Jazeera, NPR, NYT (world) | `[{ "url": "https://…/rss.xml", "name": "BBC" }]`. RSS or Atom, up to 5. |

`config.json` is re-read on every request, so after editing it you only need
to reload the page.

### Build setting

| Variable | Default | |
| --- | --- | --- |
| `VITE_MIRA_URL` | empty (same origin) | Where Mira is, when the app isn't served by Mira itself. Set it in `.env` ([example](.env.example)) or the shell. |

## Data sources

The browser talks only to Mira (`/api/*`). Mira fetches everything else.

| Module | Source | Fetched by |
| --- | --- | --- |
| Weather, forecast, AQI | [Open-Meteo](https://open-meteo.com) | Mira |
| Place name | [Nominatim / OpenStreetMap](https://nominatim.org), once per location | Mira |
| Location, when not set | [ipwho.is](https://ipwho.is), falling back to [GeoJS](https://www.geojs.io), looked up from Mira's IP | Mira |
| Crypto | [CoinGecko](https://www.coingecko.com) | Mira |
| Currency rates | [Frankfurter](https://frankfurter.dev) (ECB) | Mira |
| Stock indices | Yahoo Finance chart endpoint (unofficial) | Mira |
| Headlines | the RSS/Atom feeds in Mira's `config.json` | Mira |
| On this day | [Wikipedia](https://www.mediawiki.org/wiki/REST_API) | Mira |
| Internet speed | Cloudflare speed test, relayed by Mira (off by default, ~2.5 MB every 30 min) | Mira |
| Quotes | bundled list | — |

**Privacy.** Your coordinates are sent to Open-Meteo and Nominatim. If you don't set a `location` and the browser can't provide one, Mira's IP address is also sent to ipwho.is (or GeoJS) to find it; set `"autoLocation": false` to prevent that. Every
service above sees Mira's IP address, not the browser's. Nothing is sent anywhere else: no
analytics, no telemetry, and fonts are self-hosted.

**Stock indices.** Yahoo rate-limits hard. Mira spaces its requests out
and caches each index by its exchange's trading hours. During the session it
refreshes every 5 minutes. Before the open it holds the last close until the
bell. If Yahoo refuses, the last known value is shown.

## Running on a Raspberry Pi

1. Build the app (Node 22.18+) and publish Mira (.NET 9) as in Quick start. On the Pi,
   `dotnet publish src/Mira.Api -c Release -o /opt/mira` works.
2. Keep Mira running with systemd, in `/etc/systemd/system/mira.service`:

   ```ini
   [Unit]
   Description=Mira (Mirror Magic backend and UI)
   After=network-online.target

   [Service]
   WorkingDirectory=/opt/mira
   Environment=Mira__UiPath=/home/pi/mirror-magic/dist
   Environment=Mira__ConfigPath=/home/pi/mira-config.json
   ExecStart=/usr/bin/dotnet /opt/mira/Mira.Api.dll
   Restart=always
   User=pi

   [Install]
   WantedBy=multi-user.target
   ```

   Then enable it:

   ```bash
   sudo systemctl enable --now mira
   ```

3. Open it full-screen at login:

   ```bash
   chromium-browser --kiosk --noerrdialogs --disable-infobars http://127.0.0.1:5080
   ```

## Development

```bash
npm run dev         # Vite on http://127.0.0.1:8080, calling Mira at VITE_MIRA_URL
npm test            # unit tests
npm run lint
npm run typecheck
```

```
src/App.tsx        layout: which module goes in which screen region
src/mirror/        config schema, data hooks (all calls go to Mira), and components/
```

### Security notes

- The app only talks to Mira. When Mira serves it, the Content Security Policy is
  `connect-src 'self'`, so the page can't reach anywhere else.
- Mira only fetches URLs listed in its `config.json`; it never fetches a URL sent
  by a client, and allows cross-origin reads only from `Mira:AllowedOrigins`.
- Feed content is rendered as text, never as HTML.
- `/api/config` returns your settings, including your location. Only expose Mira
  on a network you trust.

## License

[Apache-2.0](LICENSE). Copyright 2026 Aditya Keshri.
