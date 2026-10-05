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

Requires Node.js 22.18 or newer.

```bash
git clone https://github.com/adikeshri/mirror-magic.git
cd mirror-magic
npm ci
cp config.example.json config.json   # then edit it
npm run build
npm start                            # http://127.0.0.1:8080
```

For development with hot reload, run `npm run dev`. It serves the same API.

## Configuration

Settings are layered, each overriding the one before:

1. Built-in defaults ([`src/mirror/config.ts`](src/mirror/config.ts))
2. `config.json`, for this mirror's setup. It is git-ignored, so start from
   [`config.example.json`](config.example.json).
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
| `MIRROR_CONFIG` | `config.json` | |
| `MIRROR_CACHE_DIR` | `.cache` | Market quotes are cached here across restarts. |

## Data sources

| Module | Source | Fetched by |
| --- | --- | --- |
| Weather, forecast, AQI | [Open-Meteo](https://open-meteo.com) | browser |
| Place name | [Nominatim / OpenStreetMap](https://nominatim.org), once per location | browser |
| Location, when not set | [ipwho.is](https://ipwho.is), falling back to [GeoJS](https://www.geojs.io), looked up from the server's IP | server |
| Crypto | [CoinGecko](https://www.coingecko.com) | browser |
| Currency rates | [Frankfurter](https://frankfurter.dev) (ECB) | browser |
| Stock indices | Yahoo Finance chart endpoint (unofficial) | server |
| Headlines | the RSS/Atom feeds in `config.json` | server |
| On this day | [Wikipedia](https://www.mediawiki.org/wiki/REST_API) | browser |
| Internet speed | Cloudflare speed test (off by default, ~2.5 MB every 30 min) | browser |
| Quotes | bundled list | — |

**Privacy.** Your coordinates are sent to Open-Meteo and Nominatim. If you don't set a `location` and the browser can't provide one, the server's IP address is also sent to ipwho.is (or GeoJS) to find it; set `"autoLocation": false` to prevent that. Every
service above sees the mirror's IP address. Nothing is sent anywhere else: no
analytics, no telemetry, and fonts are self-hosted.

**Stock indices.** Yahoo rate-limits hard. The server spaces its requests out
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
cp config.example.json config.json   # then edit it
docker compose up -d --build
```

Open `http://127.0.0.1:8080`. Docker restarts the mirror after a reboot or a
crash (`restart: unless-stopped`), and the container reports its health to
`docker ps`.

- `config.json` is mounted read-only, so edit it on the host and reload the
  page. No rebuild is needed.
- Market quotes are cached in the `mirror-data` volume and survive restarts.
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
server/            Node server: static files, /api routes, Yahoo cache
src/App.tsx        layout: which module goes in which screen region
src/mirror/        config schema, data hooks, and components/ for each module
```

### Security notes

- The server only fetches URLs listed in `config.json`. It never proxies a URL
  sent by a client.
- It binds to `127.0.0.1` by default and sends a strict Content Security
  Policy, so the page can only talk to the hosts listed in `server/index.ts`.
- Feed content is rendered as text, never as HTML.
- `/api/config` returns your settings, including your location. Only use
  `HOST=0.0.0.0` on a network you trust.

## License

[Apache-2.0](LICENSE). Copyright 2026 Aditya Keshri.
