import type { IntentPreset, Lead } from "./types";
import { composeSearchQuery } from "./intent";
import { fetchWithTimeout, truncate } from "./utils";

export function getUsaJobsConfig(): { apiKey: string; userAgent: string } | null {
  const apiKey = process.env.USAJOBS_API_KEY?.trim();
  const email = process.env.USAJOBS_EMAIL?.trim();
  if (!apiKey || !email) return null;
  const userAgent = process.env.USAJOBS_USER_AGENT?.trim() || email;
  return { apiKey, userAgent };
}

type UsaJobItem = {
  MatchedObjectDescriptor?: {
    PositionID?: string;
    PositionTitle?: string;
    PositionURI?: string;
    OrganizationName?: string;
    QualificationSummary?: string;
    PositionLocationDisplay?: string;
    PublicationStartDate?: string;
  };
};

export async function fetchUsaJobsLeads(
  userQ: string,
  page: number,
  intents: IntentPreset[],
): Promise<Lead[]> {
  const cfg = getUsaJobsConfig();
  if (!cfg) return [];

  const keyword = composeSearchQuery(userQ, intents) || "contractor";
  const params = new URLSearchParams({
    Keyword: keyword,
    ResultsPerPage: "25",
    Page: String(page),
  });

  const res = await fetchWithTimeout(
    `https://data.usajobs.gov/api/search?${params}`,
    {
      cache: "no-store",
      headers: {
        "User-Agent": cfg.userAgent,
        "Authorization-Key": cfg.apiKey,
        Accept: "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error(`USAJOBS HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    SearchResultItems?: UsaJobItem[];
  };
  const rows = json.SearchResultItems ?? [];

  return rows.map((item) => {
    const d = item.MatchedObjectDescriptor ?? {};
    const title = d.PositionTitle ?? "";
    const description = d.QualificationSummary ?? "";
    const url = d.PositionURI ?? "https://www.usajobs.gov/";
    const id = d.PositionID ?? url;
    return {
      id: `usajobs:${id}`,
      title,
      companyName: d.OrganizationName ?? "U.S. Government",
      location: d.PositionLocationDisplay,
      description: truncate(description, 400),
      url,
      postedAt: d.PublicationStartDate,
      source: "usajobs" as const,
      intentTags: intents,
    };
  });
}
