import { useEffect, useMemo, useState } from "react";
import { QUOTES } from "../quotes";

type Item = { kind: "news" | "quote"; text: string; meta?: string };

export function Ticker({ headlines }: { headlines: string[] }) {
  const items: Item[] = useMemo(() => {
    const news: Item[] = headlines.map((t) => ({ kind: "news", text: t, meta: "BBC" }));
    const quotes: Item[] = QUOTES.map((q) => ({ kind: "quote", text: `"${q.text}"`, meta: q.author }));
    // interleave
    const out: Item[] = [];
    const len = Math.max(news.length, quotes.length);
    for (let i = 0; i < len; i++) {
      if (news[i]) out.push(news[i]);
      if (quotes[i]) out.push(quotes[i]);
    }
    return out.length ? out : quotes;
  }, [headlines]);

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setVisible(true);
      }, 500);
    }, 12000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;
  const item = items[idx];

  return (
    <div className="text-center max-w-3xl mx-auto px-4">
      <div
        className="label-xs mb-2 transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {item.kind === "news" ? "Headlines" : "Reflection"}
      </div>
      <div
        className="light text-bright text-xl leading-relaxed transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {item.text}
      </div>
      {item.meta && (
        <div
          className="text-faint light text-sm mt-2 transition-opacity duration-500"
          style={{ opacity: visible ? 1 : 0 }}
        >
          — {item.meta}
        </div>
      )}
    </div>
  );
}
