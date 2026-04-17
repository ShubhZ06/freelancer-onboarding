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

const API = "https://remoteok.com/api";
const CACHE_KEY = "remoteok:all";
const CACHE_TTL = 5 * 60 * 1_000;

type RemoteOkRow = {
  id?: string;
  slug?: string;
  position?: string;
  company?: string;
  description?: string;
  location?: string;
  date?: string;
  url?: string;
  tags?: string[];
};

function isJobRow(row: unknown): row is RemoteOkRow {
  if (!row || typeof row !== "object") return false;
  const r = row as RemoteOkRow;
  return Boolean(r.id && r.position && r.url);
}

export async function fetchRemoteOkLeads(
  q: string,
  intents: IntentPreset[],
  opts?: { maxMatches?: number },
): Promise<Lead[]> {
  const maxMatches = opts?.maxMatches ?? 50;

  let rows = getCached<RemoteOkRow[]>(CACHE_KEY);
  if (!rows) {
    const res = await fetchWithTimeout(API, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "FOS-Client-Finder/1.0 (hackathon prototype)",
      },
    });
    if (!res.ok) throw new Error(`Remote OK HTTP ${res.status}`);
    const json = (await res.json()) as unknown[];
    rows = (Array.isArray(json) ? json.filter(isJobRow) : []) as RemoteOkRow[];
    setCached(CACHE_KEY, rows, CACHE_TTL);
  }
  const out: Lead[] = [];

  for (const row of rows) {
    if (out.length >= maxMatches) break;
    const title = row.position ?? "";
    const description = stripHtml(row.description ?? "");
    if (!matchesQuery(title, description, q)) continue;
    if (!matchesIntent(title, description, intents)) continue;

    out.push({
      id: `remoteok:${row.id}`,
      title,
      companyName: (row.company ?? "—").trim(),
      location: row.location,
      description: truncate(description, 400),
      url: row.url ?? `https://remoteok.com/remote-jobs/${row.slug}`,
      postedAt: row.date,
      source: "remoteok",
      intentTags: intents,
      rawJobType: row.tags?.join(", "),
    });
  }

  return out;
}
