import { z } from "zod";

// Every user-specific value lives here. Precedence, lowest first:
//   1. the defaults below
//   2. config.json on the server (see config.example.json)
//   3. overrides saved from the on-screen settings panel (localStorage)
// Each field falls back to its default on its own, so one bad value in
// config.json never takes the whole mirror down.

// supportedLocalesOf throws on malformed tags rather than returning [].
function isLocale(tag: string) {
  if (tag === "") return true;
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(tag).length > 0;
  } catch {
    return false;
  }
}

const Location = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  name: z.string().trim().max(80).optional(),
});

const Modules = z.object({
  greeting: z.boolean().catch(true).default(true),
  clock: z.boolean().catch(true).default(true),
  weather: z.boolean().catch(true).default(true),
  forecast: z.boolean().catch(true).default(true),
  markets: z.boolean().catch(true).default(true),
  news: z.boolean().catch(true).default(true),
  quote: z.boolean().catch(true).default(true),
  onThisDay: z.boolean().catch(true).default(true),
  // Off by default: it downloads a few MB on every run.
  network: z.boolean().catch(false).default(false),
});

const Crypto = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), label: z.string().max(16) });
const Fx = z.object({ from: z.string().regex(/^[A-Z]{3}$/), to: z.string().regex(/^[A-Z]{3}$/), label: z.string().max(16).optional() });
const Index = z.object({ symbol: z.string().regex(/^[\w^.=-]{1,20}$/), label: z.string().max(16) });

const Markets = z.object({
  crypto: z.array(Crypto).max(6).catch([]).default([
    { id: "bitcoin", label: "BTC" },
    { id: "ethereum", label: "ETH" },
  ]),
  // Currency the crypto prices are quoted in (CoinGecko vs_currency).
  cryptoCurrency: z.string().regex(/^[a-z]{3}$/).catch("usd").default("usd"),
  fx: z.array(Fx).max(6).catch([]).default([{ from: "EUR", to: "USD" }]),
  // Yahoo Finance symbols, fetched through the bundled server.
  indices: z.array(Index).max(6).catch([]).default([{ symbol: "^GSPC", label: "S&P 500" }]),
});

const Feed = z.object({ url: z.string().url().regex(/^https?:\/\//), name: z.string().max(40) });

export const SettingsSchema = z.object({
  name: z.string().trim().max(40).catch("").default(""),
  // BCP 47 tag such as "en-GB". Empty means the browser's locale.
  locale: z.string().refine(isLocale).catch("").default(""),
  hour24: z.boolean().catch(false).default(false),
  units: z.enum(["metric", "imperial"]).catch("metric").default("metric"),
  // null means "ask the browser for its position".
  location: Location.nullable().catch(null).default(null),
  modules: Modules.catch(Modules.parse({})).default({}),
  markets: Markets.catch(Markets.parse({})).default({}),
  news: z
    .object({
      feeds: z.array(Feed).max(5).catch([]).default([{ url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC" }]),
    })
    .catch({ feeds: [] })
    .default({}),
});

export type Settings = z.infer<typeof SettingsSchema>;
export type ModuleName = keyof Settings["modules"];
export type Coords = { lat: number; lon: number; name?: string };

// Fields the settings panel may change. Everything else is config.json only.
export type Overrides = Partial<Pick<Settings, "name" | "hour24" | "units" | "location">> & {
  modules?: Partial<Settings["modules"]>;
};

export const DEFAULT_SETTINGS: Settings = SettingsSchema.parse({});

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function resolveSettings(fileConfig: unknown, overrides: Overrides): Settings {
  const base = isObject(fileConfig) ? fileConfig : {};
  const baseModules = isObject(base.modules) ? base.modules : {};
  return SettingsSchema.parse({
    ...base,
    ...overrides,
    modules: { ...baseModules, ...overrides.modules },
  });
}
