import { DEFAULT_SETTINGS, resolveSettings } from "./config";

describe("resolveSettings", () => {
  it("uses defaults when there is no config", () => {
    expect(resolveSettings(undefined, {})).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS.name).toBe("");
    expect(DEFAULT_SETTINGS.modules.network).toBe(false);
  });

  it("applies config.json, then panel overrides on top", () => {
    const s = resolveSettings(
      { name: "Config", units: "imperial", modules: { quote: false, news: false } },
      { name: "Panel", modules: { news: true } },
    );
    expect(s.name).toBe("Panel");
    expect(s.units).toBe("imperial");
    expect(s.modules.quote).toBe(false); // from config, untouched by override
    expect(s.modules.news).toBe(true); // override wins
  });

  it("drops only the invalid fields", () => {
    const s = resolveSettings(
      {
        name: "Ok",
        units: "kelvin",
        location: { lat: 999, lon: 0 },
        locale: "not a locale!!",
        markets: { indices: [{ symbol: "^NSEI", label: "NIFTY" }], fx: "nope" },
        news: { feeds: [{ url: "javascript:alert(1)", name: "x" }] },
      },
      {},
    );
    expect(s.name).toBe("Ok");
    expect(s.units).toBe("metric");
    expect(s.location).toBeNull();
    expect(s.locale).toBe("");
    expect(s.markets.indices).toEqual([{ symbol: "^NSEI", label: "NIFTY" }]);
    expect(s.markets.fx).toEqual([]);
    expect(s.news.feeds).toEqual([]);
  });

  it("ignores a config that isn't an object", () => {
    expect(resolveSettings([1, 2], {})).toEqual(DEFAULT_SETTINGS);
    expect(resolveSettings("x", {})).toEqual(DEFAULT_SETTINGS);
  });
});
