import { QUOTES } from "../quotes";
import { useRotation } from "../useRotation";

const ROTATE_MS = 60_000;

export function Quote() {
  const i = useRotation(QUOTES.length, ROTATE_MS, true);
  const q = QUOTES[i];
  return (
    <figure key={i} className="fade-in">
      <blockquote className="text-normal" style={{ fontSize: "1.45rem", lineHeight: 1.4, fontWeight: 300 }}>
        “{q.text}”
      </blockquote>
      <figcaption className="mt-[0.4rem] text-faint" style={{ fontSize: "1rem" }}>
        {q.author}
      </figcaption>
    </figure>
  );
}
