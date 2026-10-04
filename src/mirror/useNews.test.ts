import { parseFeed } from "./useNews";

describe("parseFeed", () => {
  it("reads RSS items", () => {
    const xml = `<rss><channel><title>Feed</title>
      <item><title><![CDATA[First & <b>bold</b>]]></title><pubDate>Mon, 05 Oct 2026 10:00:00 GMT</pubDate></item>
      <item><title>Second</title></item>
      <item><title> </title></item>
    </channel></rss>`;
    const items = parseFeed(xml, "BBC");
    expect(items.map((i) => i.title)).toEqual(["First & <b>bold</b>", "Second"]);
    expect(items[0].publishedAt?.toISOString()).toBe("2026-10-05T10:00:00.000Z");
    expect(items[1].publishedAt).toBeNull();
    expect(items[0].source).toBe("BBC");
  });

  it("reads Atom entries", () => {
    const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><title>Feed</title>
      <entry><title>Atom one</title><updated>2026-10-05T09:00:00Z</updated></entry></feed>`;
    expect(parseFeed(xml, "X").map((i) => i.title)).toEqual(["Atom one"]);
  });

  it("returns nothing for malformed XML", () => {
    expect(parseFeed("<rss><item><title>oops", "X")).toEqual([]);
  });
});
