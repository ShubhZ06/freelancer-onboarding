import type { IntentPreset, Lead } from "./types";
import { composeSearchQuery } from "./intent";
import { fetchWithTimeout, truncate } from "./utils";

export function getAdzunaConfig(): {
  app_id: string;
  app_key: string;
  country: string;
} | null {
  const app_id = process.env.ADZUNA_APP_ID;
  const app_key = process.env.ADZUNA_APP_KEY;
  const country = process.env.ADZUNA_COUNTRY ?? "gb";
  if (!app_id || !app_key) return null;
  return { app_id, app_key, country };
}

type AdzunaHit = {
  id?: string | number;
  title?: string;
  description?: string;
  redirect_url?: string;
  created?: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
};

function companyFromHit(hit: AdzunaHit): string {
  return hit.company?.display_name ?? "—";
}

function locationFromHit(hit: AdzunaHit): string | undefined {
  return hit.location?.display_name;
}

export async function fetchAdzunaLeads(
  userQ: string,
  where: string,
  page: number,
  intents: IntentPreset[],
): Promise<Lead[]> {
  const cfg = getAdzunaConfig();
  if (!cfg) return [];

  const what = composeSearchQuery(userQ, intents) || "freelance consultant";
  const base = `https://api.adzuna.com/v1/api/jobs/${cfg.country}/search/${page}`;
  const params = new URLSearchParams({
    app_id: cfg.app_id,
    app_key: cfg.app_key,
    results_per_page: "25",
    what,
  });
  if (where.trim()) params.set("where", where.trim());

  const res = await fetchWithTimeout(`${base}?${params}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Adzuna HTTP ${res.status}`);
  }

  const json = (await res.json()) as { results?: AdzunaHit[] };
  const rows = json.results ?? [];

  return rows.map((hit) => {
    const title = hit.title ?? "";
    const description = hit.description ?? "";
    const url = hit.redirect_url ?? "";
    const id = String(hit.id ?? (url || title));
    return {
      id: `adzuna:${id}`,
      title,
      companyName: companyFromHit(hit),
      location: locationFromHit(hit),
      description: truncate(description, 400),
      url,
      postedAt: hit.created,
      source: "adzuna" as const,
      intentTags: intents,
    };
  });
}
