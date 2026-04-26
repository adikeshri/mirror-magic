import { useEffect, useState } from "react";

const FEED = "https://feeds.bbci.co.uk/news/world/rss.xml";
const FALLBACK_SOURCE = "BBC";

export type NewsItem = {
  title: string;
  source: string;
  publishedAt?: string;
};

export function useNews() {
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED)}`
        );
        const j = await r.json();
        if (cancelled) return;
        const items: NewsItem[] = (j?.items ?? [])
          .map((it: { title: string; source_id?: string; pubDate?: string }) => ({
            title: it.title,
            source: it.source_id || FALLBACK_SOURCE,
            publishedAt: it.pubDate,
          }))
          .slice(0, 15);
        setHeadlines(items);
      } catch (e) {
        console.error("[mirror] news load failed", e);
      }
    };
    load();
    const id = setInterval(load, 1000 * 60 * 10);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return headlines;
}
