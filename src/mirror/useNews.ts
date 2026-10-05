import { useQuery } from "@tanstack/react-query";
import { Settings } from "./config";

export type NewsItem = { title: string; source: string; url: string | null; publishedAt: Date | null };

const REFRESH_MS = 10 * 60 * 1000;
const MAX_ITEMS = 20;

// Handles RSS <item> and Atom <entry>. Only text content is read, never markup.
export function parseFeed(xml: string, source: string): NewsItem[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return [];
  return Array.from(doc.querySelectorAll("item, entry")).flatMap((el) => {
    const title = el.querySelector("title")?.textContent?.trim();
    if (!title) return [];
    const when = el.querySelector("pubDate, published, updated")?.textContent;
    const date = when ? new Date(when) : null;
    // RSS has <link>text</link>, Atom has <link href>. Only http(s) links are kept.
    const link = el.querySelector("link");
    const href = (link?.getAttribute("href") || link?.textContent || "").trim();
    return [{ title, source, url: /^https?:\/\//.test(href) ? href : null, publishedAt: date && !Number.isNaN(date.getTime()) ? date : null }];
  });
}

// Feeds are fetched by index through our server, which only fetches the URLs
// listed in config.json (browsers can't read most RSS feeds directly: no CORS).
async function loadNews(feeds: Settings["news"]["feeds"], offset: number): Promise<NewsItem[]> {
  const lists = await Promise.all(
    feeds.map(async (f, i) => {
      try {
        const r = await fetch(`/api/feed/${offset + i}`, { signal: AbortSignal.timeout(20_000) });
        return r.ok ? parseFeed(await r.text(), f.name) : [];
      } catch {
        return [];
      }
    }),
  );
  const items = lists.flat();
  if (items.length === 0 && feeds.length > 0) throw new Error("no feed could be loaded");
  return items
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
    .slice(0, MAX_ITEMS);
}

// `offset` is where this list starts in the server's combined feed index.
export function useNews(feeds: Settings["news"]["feeds"], enabled: boolean, offset = 0) {
  return (
    useQuery({
      queryKey: ["news", offset, JSON.stringify(feeds)],
      queryFn: () => loadNews(feeds, offset),
      enabled: enabled && feeds.length > 0,
      refetchInterval: REFRESH_MS,
      staleTime: REFRESH_MS,
    }).data ?? []
  );
}
