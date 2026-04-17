import type { IntentPreset, Lead } from "./types";
import { composeSearchQuery } from "./intent";
import { fetchWithTimeout, truncate } from "./utils";

export function getJoobleConfig(): { apiKey: string } | null {
  const apiKey = process.env.JOOBLE_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey };
}

type JoobleJob = {
  title?: string;
  company?: string;
  snippet?: string;
  description?: string;
  link?: string;
  url?: string;
  location?: string;
  updated?: string;
  type?: string;
};

export async function fetchJoobleLeads(
  userQ: string,
  location: string,
  page: number,
  intents: IntentPreset[],
): Promise<Lead[]> {
  const cfg = getJoobleConfig();
  if (!cfg) return [];

  const keywords = composeSearchQuery(userQ, intents) || "freelance remote";
  const endpoint = `https://jooble.org/api/${encodeURIComponent(cfg.apiKey)}`;
  const res = await fetchWithTimeout(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      keywords,
      location: location.trim() || undefined,
      page,
      searchMode: "json",
    }),
  });

  if (!res.ok) {
    throw new Error(`Jooble HTTP ${res.status}`);
  }

  const json = (await res.json()) as { jobs?: JoobleJob[] };
  const rows = json.jobs ?? [];

  return rows.map((hit) => {
    const title = hit.title ?? "";
    const description = hit.snippet ?? hit.description ?? "";
    const link = hit.link ?? hit.url ?? "";
    return {
      id: `jooble:${link || title}`,
      title,
      companyName: hit.company ?? "—",
      location: hit.location,
      description: truncate(description, 400),
      url: link || "https://jooble.org",
      postedAt: hit.updated,
      source: "jooble" as const,
      intentTags: intents,
      rawJobType: hit.type,
    };
  });
}
