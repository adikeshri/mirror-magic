import { useEffect, useMemo, useState } from "react";

// Shown on every load while config and the first data arrive.
const MIN_MS = 3400; // long enough to read, even when everything is cached
const MAX_MS = 9000; // a dead endpoint never holds the mirror hostage
const LETTER_MS = 55;

function salutation(h: number) {
  return h < 5 ? "Hello" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Letters({ text, start }: { text: string; start: number }) {
  return (
    <span aria-label={text}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden className="welcome-letter" style={{ animationDelay: `${start + i * LETTER_MS}ms` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

type Props = {
  name: string;
  ready: boolean; // config loaded, so the name is known
  loaded: boolean; // first data is in
  onReveal: (v: true) => void; // the mirror starts appearing behind the fading overlay
  onGone: () => void;
};

export function Welcome({ name, ready, loaded, onReveal, onGone }: Props) {
  const [minDone, setMinDone] = useState(false);
  const [maxDone, setMaxDone] = useState(false);
  useEffect(() => {
    const a = window.setTimeout(() => setMinDone(true), MIN_MS);
    const b = window.setTimeout(() => setMaxDone(true), MAX_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  const leaving = ready && ((minDone && loaded) || maxDone);
  useEffect(() => {
    if (leaving) onReveal(true);
  }, [leaving, onReveal]);

  const motes = useMemo(
    () =>
      Array.from({ length: 24 }, () => ({
        left: `${Math.random() * 100}%`,
        size: `${0.12 + Math.random() * 0.22}rem`,
        dur: `${11 + Math.random() * 10}s`,
        delay: `${-Math.random() * 20}s`,
        sway: `${(Math.random() - 0.5) * 8}rem`,
        peak: (0.25 + Math.random() * 0.55).toFixed(2),
      })),
    [],
  );

  const now = new Date();
  const hello = salutation(now.getHours());
  const nameStart = 700 + hello.length * 30;
  const afterText = (name ? nameStart + name.length * LETTER_MS : 600 + hello.length * LETTER_MS) + 500;

  return (
    <div
      className={`welcome ${leaving ? "is-leaving" : ""}`}
      role="status"
      aria-label="Loading mirror"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && e.animationName === "welcome-out") onGone();
      }}
    >
      <div className="welcome-motes" aria-hidden>
        {motes.map((m, i) => (
          <span
            key={i}
            style={{
              left: m.left,
              width: m.size,
              height: m.size,
              animationDuration: m.dur,
              animationDelay: m.delay,
              ["--sway" as string]: m.sway,
              ["--peak" as string]: m.peak,
            }}
          />
        ))}
      </div>

      <div className="welcome-stage">
        <div className="welcome-core">
          <div className="welcome-glow" aria-hidden />

          <svg className="welcome-halo" viewBox="0 0 200 200" aria-hidden>
            <defs>
              <linearGradient id="welcome-comet" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#fff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <filter id="welcome-bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.6" />
              </filter>
            </defs>
            <circle className="halo-outer" cx="100" cy="100" r="97" pathLength={1} />
            <g className="halo-spin">
              <circle className="halo-main" cx="100" cy="100" r="90" pathLength={1} stroke="url(#welcome-comet)" />
              <circle cx="100" cy="10" r="2.6" fill="#fff" filter="url(#welcome-bloom)" className="halo-spark" />
              <circle cx="100" cy="10" r="0.9" fill="#fff" className="halo-spark" />
            </g>
            <circle className="halo-dots" cx="100" cy="100" r="82" />
          </svg>

          <div className="welcome-text">
            {ready && (
              <>
                <p
                  className={name ? "text-dim" : "text-bright welcome-shine"}
                  style={{ fontSize: name ? "2.2rem" : "4.6rem", fontWeight: 100, letterSpacing: "0.02em" }}
                >
                  <Letters text={hello} start={500} />
                </p>
                {name && (
                  <p className="welcome-shine text-bright" style={{ fontSize: "5.4rem", fontWeight: 100, lineHeight: 1.1 }}>
                    <Letters text={name} start={nameStart} />
                  </p>
                )}
                <p className="welcome-after label mt-[1.4rem]" style={{ animationDelay: `${afterText}ms` }}>
                  {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="welcome-after welcome-progress" style={{ animationDelay: "1600ms" }} aria-hidden>
          <div className="welcome-track">
            <div className="welcome-fill" />
            {leaving && <div className="welcome-fill is-done" />}
          </div>
          <p key={leaving ? "ready" : "wait"} className="label fade-in mb-0 mt-[0.9rem]">
            {leaving ? "All set" : "Gathering your day"}
          </p>
        </div>
      </div>
    </div>
  );
}
