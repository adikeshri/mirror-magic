import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Overrides, resolveSettings } from "./config";
import { apiUrl } from "./fetchJson";

const KEY = "mirror.settings.v2";
const LEGACY_KEYS = ["mirror.settings.v1"];

function readOverrides(): Overrides {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    const o = parsed as Overrides;
    if (o.modules !== undefined && (typeof o.modules !== "object" || o.modules === null)) delete o.modules;
    return o;
  } catch {
    return {};
  }
}

function writeOverrides(o: Overrides) {
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch {
    /* storage full or blocked: settings just won't persist */
  }
}

async function fetchFileConfig(): Promise<unknown> {
  // Missing when Mira has no answer for this build; defaults apply.
  const r = await fetch(apiUrl("/api/config"), { signal: AbortSignal.timeout(5000) });
  return r.ok ? r.json() : {};
}

export function useSettings() {
  const file = useQuery({
    queryKey: ["config"],
    queryFn: fetchFileConfig,
    staleTime: Infinity,
    retry: 1,
  });
  const [overrides, setOverrides] = useState<Overrides>(readOverrides);

  const settings = useMemo(() => resolveSettings(file.data, overrides), [file.data, overrides]);

  const update = useCallback((patch: Overrides) => {
    setOverrides((prev) => {
      const next = { ...prev, ...patch, modules: { ...prev.modules, ...patch.modules } };
      writeOverrides(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    writeOverrides({});
    setOverrides({});
  }, []);

  return { settings, update, reset, ready: !file.isPending };
}
