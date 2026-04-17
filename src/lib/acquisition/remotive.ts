import type { IntentPreset, Lead } from "./types";
import { matchesIntent } from "./intent";
import {
  fetchWithTimeout,
  getCached,
  matchesQuery,
  setCached,
  stripHtml,
  truncate,
} from "./utils";

const API = "https://remotive.com/api/remote-jobs";
const CACHE_KEY = "remotive:all";
const CACHE_TTL = 5 * 60 * 1_000;

type RemotiveJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  candidate_required_location?: string;
  publication_date?: string;
  description?: string;
  job_type?: string;
};

export async function fetchRemotiveLeads(
  q: string,
  intents: IntentPreset[],
  opts?: { maxMatches?: number },
): Promise<Lead[]> {
  const maxMatches = opts?.maxMatches ?? 50;

  let rows = getCached<RemotiveJob[]>(CACHE_KEY);
  if (!rows) {
    const res = await fetchWithTimeout(API, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`);
    const json = (await res.json()) as { jobs?: RemotiveJob[] };
    rows = json.jobs ?? [];
    setCached(CACHE_KEY, rows, CACHE_TTL);
  }
  const out: Lead[] = [];

  for (const row of rows) {
    if (out.length >= maxMatches) break;
    const title = row.title ?? "";
    const description = stripHtml(row.description ?? "");
    if (!matchesQuery(title, description, q)) continue;
    if (!matchesIntent(title, description, intents)) continue;

    out.push({
      id: `remotive:${row.id}`,
      title,
      companyName: row.company_name ?? "—",
      location: row.candidate_required_location,
      description: truncate(description, 400),
      url: row.url,
      postedAt: row.publication_date,
      source: "remotive",
      intentTags: intents,
      rawJobType: row.job_type,
    });
  }

  return out;
}
