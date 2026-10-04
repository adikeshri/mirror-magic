import { describe, expect, it } from "vitest";
import { toLocation } from "./geoip.ts";

describe("toLocation", () => {
  it("reads numbers and numeric strings", () => {
    expect(toLocation({ latitude: 12.97, longitude: 77.59, city: "Bengaluru", region: "Karnataka" })).toEqual({
      lat: 12.97,
      lon: 77.59,
      name: "Bengaluru, Karnataka",
    });
    expect(toLocation({ latitude: "12.9753", longitude: "77.591", city: "Bengaluru" })?.lat).toBe(12.9753);
  });

  it("tolerates a missing city", () => {
    expect(toLocation({ latitude: 1, longitude: 2 })?.name).toBe("");
  });

  it("rejects missing, junk and out-of-range coordinates", () => {
    expect(toLocation({})).toBeNull();
    expect(toLocation({ latitude: "abc", longitude: 1 })).toBeNull();
    expect(toLocation({ latitude: 91, longitude: 0 })).toBeNull();
    expect(toLocation({ latitude: 0, longitude: -181 })).toBeNull();
    expect(toLocation({ latitude: null, longitude: null })).toBeNull();
  });
});
