# Mirror Magic

A minimal, self-hosted smart mirror dashboard. Put a monitor behind two-way
glass, point a browser at it, and you get the time, weather, markets, headlines
and a quote, as thin white text on pure black, so the mirror still reflects.

- **No accounts, no API keys.** Every data source is free and keyless.
- **One small server, no runtime dependencies.** It serves the app and fetches
  the two things browsers can't fetch themselves (RSS feeds and stock indices).
- **Configured with one JSON file**, plus an on-screen settings panel.
- **Built for a mirror.** It scales to any screen and works in portrait or
  landscape. The centre stays clear for your reflection, the layout drifts a
  few pixels to prevent burn-in, and the cursor hides itself.

## Quick start

Requires Node.js 22.18 or newer, and [Mira](https://github.com/adikeshri/mira)
(.NET 9), the backend that supplies all the data. Start Mira first:

```bash
cd ../mira
cp config.example.json config.json   # then edit it
dotnet run --project src/Mira.Api    # http://127.0.0.1:5080
```

Then the mirror:

```bash
git clone https://github.com/adikeshri/mirror-magic.git
cd mirror-magic
npm ci
npm run build
npm start                            # http://127.0.0.1:8080
```

For development with hot reload, run `npm run dev`. Like `npm start`, it forwards `/api` to Mira.

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

### Server environment

Set these in the shell, or copy [`.env.example`](.env.example) to `.env`.

| Variable | Default | |
| --- | --- | --- |
| `PORT` | `8080` | |
| `HOST` | `127.0.0.1` | Set `0.0.0.0` to reach the mirror from other devices on your network. |
| `MIRA_URL` | `http://127.0.0.1:5080` | Where Mira runs. The server forwards `/api/*` there. |

## Data sources

The browser talks only to this server, which forwards `/api/*` to Mira. Mira
fetches everything else.

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

## Running with Docker (recommended on a Raspberry Pi)

Works on a Raspberry Pi 3, 4 or 5 running a **64-bit** OS, and on any other
machine with Docker. The image is built on the device itself, so it always
matches the CPU.

```bash
git clone https://github.com/adikeshri/mirror-magic.git
cd mirror-magic
docker compose up -d --build        # expects Mira on the host at :5080 (override with MIRA_URL)
```

Open `http://127.0.0.1:8080`. Docker restarts the mirror after a reboot or a
crash (`restart: unless-stopped`), and the container reports its health to
`docker ps`.

- The container reaches Mira at `MIRA_URL` (default: Mira running on the Docker
  host, port 5080). Mira holds `config.json` and the data caches.
- The port is published on `127.0.0.1` only. To reach the mirror from other
  devices, change the port mapping in `docker-compose.yml` to `"8080:8080"`.
- The container runs as an unprivileged user with a read-only filesystem and
  all capabilities dropped.

To update: `git pull && docker compose up -d --build`.

Then open it full-screen at login:

```bash
chromium-browser --kiosk --noerrdialogs --disable-infobars http://127.0.0.1:8080
```

## Running on a Raspberry Pi without Docker

1. Install Node 22.18+ and build the app as in Quick start.
2. Keep the server running with systemd, in `/etc/systemd/system/mirror.service`:

   ```ini
   [Unit]
   Description=Mirror Magic
   After=network-online.target

   [Service]
   WorkingDirectory=/home/pi/mirror-magic
   ExecStart=/usr/bin/node --env-file-if-exists=.env server/index.ts
   Restart=always
   User=pi

   [Install]
   WantedBy=multi-user.target
   ```

   Then enable it:

   ```bash
   sudo systemctl enable --now mirror
   ```

3. Open it full-screen at login:

   ```bash
   chromium-browser --kiosk --noerrdialogs --disable-infobars http://127.0.0.1:8080
   ```

## Development

```bash
npm run dev         # Vite + API on http://127.0.0.1:8080
npm test            # unit tests
npm run lint
npm run typecheck
```

```
server/            Node server: static files, and /api forwarded to Mira
src/App.tsx        layout: which module goes in which screen region
src/mirror/        config schema, data hooks, and components/ for each module
```

### Security notes

- The server forwards only GET requests under `/api/` to `MIRA_URL`; it never
  proxies a URL sent by a client.
- It binds to `127.0.0.1` by default and sends a strict Content Security
  Policy (`connect-src 'self'`), so the page can only talk to this server.
- Feed content is rendered as text, never as HTML.
- `/api/config` returns your settings, including your location. Only use
  `HOST=0.0.0.0` on a network you trust.

## License

[Apache-2.0](LICENSE). Copyright 2026 Aditya Keshri.
