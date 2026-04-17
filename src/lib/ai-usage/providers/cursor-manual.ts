import type { AiUsageCredentials } from "../types";
import type { NormalizedUsageRow } from "../types";
import { healthFromPercent } from "../thresholds";

function parseNum(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function pickUsed(creds: AiUsageCredentials): number | null {
  if (creds.cursorFastRequestsUsed != null && Number.isFinite(creds.cursorFastRequestsUsed)) {
    return creds.cursorFastRequestsUsed;
  }
  return parseNum(process.env.CURSOR_FAST_REQUESTS_USED);
}

function pickLimit(creds: AiUsageCredentials): number | null {
  if (creds.cursorFastRequestsLimit != null && Number.isFinite(creds.cursorFastRequestsLimit)) {
    return creds.cursorFastRequestsLimit;
  }
  return parseNum(process.env.CURSOR_FAST_REQUESTS_LIMIT);
}

/**
 * Cursor does not expose a public billing API. Manual counters from saved credentials or env.
 */
export function buildCursorManualRow(
  warnPercent: number,
  criticalPercent: number,
  creds: AiUsageCredentials = {}
): NormalizedUsageRow {
  const polledAt = new Date().toISOString();
  const used = pickUsed(creds);
  const limit = pickLimit(creds);

  if (used == null || limit == null || limit <= 0) {
    return {
      providerId: "cursor",
      displayName: "Cursor (manual)",
      percentOfLimit: null,
      syntheticPercent: null,
      limitLabel: null,
      displayPrimary: "Manual quota not set",
      displaySecondary: "Enter fast request used/limit below or set CURSOR_* env vars.",
      health: "unknown",
      sourceStatus: "skipped",
      detail: null,
      polledAt,
    };
  }

  const percent = Math.min(100, (used / limit) * 100);

  return {
    providerId: "cursor",
    displayName: "Cursor (manual)",
    percentOfLimit: percent,
    syntheticPercent: null,
    limitLabel: `${Math.round(used)} / ${Math.round(limit)} fast requests`,
    displayPrimary: `${Math.round(used)} used`,
    displaySecondary: `${percent.toFixed(0)}% of configured limit`,
    health: healthFromPercent(percent, warnPercent, criticalPercent),
    sourceStatus: "manual_env",
    detail: null,
    polledAt,
  };
}
