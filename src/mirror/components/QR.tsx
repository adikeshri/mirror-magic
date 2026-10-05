import { useMemo } from "react";
import qrcode from "qrcode-generator";

// Dark modules on a pale tile: the one polarity every phone camera reads.
export function QR({ url, size = "4.4rem" }: { url: string; size?: string }) {
  const d = useMemo(() => {
    const qr = qrcode(0, "L");
    qr.addData(url);
    qr.make();
    const n = qr.getModuleCount();
    let path = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) path += `M${x + 2} ${y + 2}h1v1h-1z`;
    return { n: n + 4, path };
  }, [url]);
  return (
    <svg viewBox={`0 0 ${d.n} ${d.n}`} width={size} height={size} className="shrink-0 rounded-[0.3rem] opacity-70" aria-hidden>
      <rect width={d.n} height={d.n} fill="#fff" />
      <path d={d.path} fill="#000" shapeRendering="crispEdges" />
    </svg>
  );
}
