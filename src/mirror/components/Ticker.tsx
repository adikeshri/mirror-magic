import { useEffect, useState } from "react";
import { QUOTES } from "../quotes";
import type { NewsItem } from "../useNews";

type QuoteItem = { text: string; author: string };
type ZenQuote = { q: string; a: string };

function formatHeadlineTimestamp(timestamp?: string) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

function getRandomLocalQuote(): QuoteItem {
  const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return { text: `"${random.text}"`, author: random.author };
}

export function Ticker({ headlines }: { headlines: NewsItem[] }) {
  const [quote, setQuote] = useState<QuoteItem>(() => getRandomLocalQuote());
  const [hasLiveQuote, setHasLiveQuote] = useState(false);
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [headlineVisible, setHeadlineVisible] = useState(true);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    let active = true;

    const loadQuote = async () => {
      try {
        const response = await fetch("https://zenquotes.io/api/random");
        if (!response.ok) throw new Error(`ZenQuotes HTTP ${response.status}`);
        const data: unknown = await response.json();
        const first = Array.isArray(data) ? (data[0] as ZenQuote | undefined) : undefined;
        if (!first?.q || !first?.a) throw new Error("Unexpected ZenQuotes response");
        if (active) {
          setQuote({ text: `"${first.q}"`, author: first.a });
          setHasLiveQuote(true);
        }
      } catch {
        if (active) {
          setHasLiveQuote(false);
          setQuote(getRandomLocalQuote());
        }
      }
    };

    loadQuote();
    const id = setInterval(loadQuote, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (headlines.length === 0) return;
    const id = setInterval(() => {
      setHeadlineVisible(false);
      setTimeout(() => {
        setHeadlineIdx((i) => (i + 1) % headlines.length);
        setHeadlineVisible(true);
      }, 500);
    }, 12000);
    return () => clearInterval(id);
  }, [headlines.length]);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        if (!hasLiveQuote) {
          setQuote(getRandomLocalQuote());
        }
        setQuoteVisible(true);
      }, 500);
    }, 12000);
    return () => clearInterval(id);
  }, [hasLiveQuote]);

  const visibleHeadline = headlines.length
    ? headlines[headlineIdx % headlines.length]
    : { title: "Loading headlines...", source: "...", publishedAt: undefined };
  const headlineTimestamp = formatHeadlineTimestamp(visibleHeadline.publishedAt);

  return (
    <div className="relative w-full px-12 min-h-[11rem]">
      <div className="max-w-md ml-auto text-right">
        <div
          className="label-xs mb-2 transition-opacity duration-500"
          style={{ opacity: headlineVisible ? 1 : 0 }}
        >
          Headlines
        </div>
        <div
          className="light text-bright text-xl leading-relaxed transition-opacity duration-500"
          style={{ opacity: headlineVisible ? 1 : 0 }}
        >
          <div className="text-lg">
            {visibleHeadline.title}
          </div>
          {headlineTimestamp ? (
            <div className="text-faint light text-xs mt-1">{headlineTimestamp}</div>
          ) : null}
          <div className="text-faint light text-sm mt-1">
            {visibleHeadline.source}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center">
        <div className="text-center max-w-3xl px-4">
          <div
            className="label-xs mb-2 transition-opacity duration-500"
            style={{ opacity: quoteVisible ? 1 : 0 }}
          >
            Reflection
          </div>
          <div
            className="light text-bright text-xl leading-relaxed transition-opacity duration-500"
            style={{ opacity: quoteVisible ? 1 : 0 }}
          >
            {quote.text}
          </div>
          <div
            className="text-faint light text-sm mt-2 transition-opacity duration-500"
            style={{ opacity: quoteVisible ? 1 : 0 }}
          >
            — {quote.author}
          </div>
        </div>
      </div>
    </div>
  );
}
