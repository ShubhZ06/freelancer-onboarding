import type { IntentPreset, Lead, LeadSource } from "./types";
import { intentMatchScore } from "./intent";

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return u.href.toLowerCase().replace(/\/$/, "");
  } catch {
    return url.toLowerCase().trim();
  }
}

const SOURCE_PRIORITY: Record<LeadSource, number> = {
  adzuna: 4,
  jooble: 3,
  usajobs: 3,
  arbeitnow: 2,
  remotive: 2,
  remoteok: 2,
  mock: 0,
};

export function mergeAndDedupe(
  batches: Lead[][],
  intents: IntentPreset[],
): Lead[] {
  const byKey = new Map<string, Lead>();

  for (const batch of batches) {
    for (const lead of batch) {
      const key = normalizeUrl(lead.url) || `${lead.source}:${lead.id}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, lead);
        continue;
      }
      const prefer =
        SOURCE_PRIORITY[lead.source] > SOURCE_PRIORITY[existing.source]
          ? lead
          : existing;
      byKey.set(key, prefer);
    }
  }

  const list = [...byKey.values()];
  list.sort(
    (a, b) =>
      intentMatchScore(b.title, b.description, intents) -
      intentMatchScore(a.title, a.description, intents),
  );
  return list;
}
