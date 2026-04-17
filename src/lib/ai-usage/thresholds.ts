import type { UsageHealth } from "./types";

export function healthFromPercent(
  percent: number | null,
  warnAt: number,
  criticalAt: number
): UsageHealth {
  if (percent == null || Number.isNaN(percent)) return "unknown";
  if (percent >= criticalAt) return "critical";
  if (percent >= warnAt) return "warn";
  return "ok";
}

export function worstHealth(a: UsageHealth, b: UsageHealth): UsageHealth {
  const rank: Record<UsageHealth, number> = {
    critical: 3,
    warn: 2,
    ok: 1,
    unknown: 0,
  };
  return rank[a] >= rank[b] ? a : b;
}
