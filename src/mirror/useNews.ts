import { useEffect, useState } from "react";

const FEED = "https://feeds.bbci.co.uk/news/world/rss.xml";

export function useNews() {
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED)}`
        );
        const j = await r.json();
        if (cancelled) return;
        const items: string[] = (j?.items ?? []).map((it: { title: string }) => it.title).slice(0, 15);
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
