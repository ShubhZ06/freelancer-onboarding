import type { IntentPreset, Lead } from "./types";
import { matchesIntent } from "./intent";
import { fetchWithTimeout, matchesQuery, stripHtml, truncate } from "./utils";

const API = "https://www.arbeitnow.com/api/job-board-api";

type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  url: string;
  location?: string;
  created_at?: string;
  remote?: boolean;
  job_types?: string[];
};

export async function fetchArbeitnowLeads(
  q: string,
  intents: IntentPreset[],
  opts?: { maxScan?: number; maxMatches?: number },
): Promise<Lead[]> {
  const maxScan = opts?.maxScan ?? 3_500;
  const maxMatches = opts?.maxMatches ?? 50;

  const res = await fetchWithTimeout(API, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Arbeitnow HTTP ${res.status}`);
  }

  const json = (await res.json()) as { data?: ArbeitnowJob[] };
  const rows = json.data ?? [];
  const out: Lead[] = [];

  for (
    let i = 0;
    i < rows.length && i < maxScan && out.length < maxMatches;
    i++
  ) {
    const row = rows[i];
    const title = row.title ?? "";
    const description = stripHtml(row.description ?? "");
    if (!matchesQuery(title, description, q)) continue;
    if (!matchesIntent(title, description, intents)) continue;

    const url =
      row.url?.trim() || `https://www.arbeitnow.com/en/job/${row.slug}`;
    out.push({
      id: `arbeitnow:${row.slug}`,
      title,
      companyName: row.company_name ?? "—",
      location: row.location,
      description: truncate(description, 400),
      url,
      postedAt: row.created_at,
      source: "arbeitnow",
      intentTags: intents,
      rawJobType: row.job_types?.join(", "),
    });
  }

  return out;
}
