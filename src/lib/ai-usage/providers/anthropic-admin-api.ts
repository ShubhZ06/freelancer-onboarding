/** Anthropic Usage & Cost Admin API — org cost report (sk-ant-admin… keys only). */

const ANTHROPIC_API = "https://api.anthropic.com";

export type AnthropicCostReportResult =
  | { ok: true; totalUsd: number; polledAt: string }
  | { ok: false; errorMessage: string; polledAt: string };

function parseAnthropicErrorMessage(json: unknown): string | null {
  if (json == null || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  const err = o.error;
  if (err && typeof err === "object") {
    const m = (err as Record<string, unknown>).message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  if (typeof o.message === "string" && o.message.length > 0) return o.message;
  return null;
}

/**
 * Sums organization API cost for the current calendar month (UTC) from the cost report.
 * Amounts are in cents; see https://docs.anthropic.com/en/api/usage-cost-api
 */
export async function fetchAnthropicOrgCostMonthUsd(adminApiKey: string): Promise<AnthropicCostReportResult> {
  const polledAt = new Date().toISOString();
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const ending = now;

  let totalCents = 0;
  let page: string | undefined;

  try {
    do {
      const params = new URLSearchParams();
      params.set("starting_at", start.toISOString());
      params.set("ending_at", ending.toISOString());
      params.set("bucket_width", "1d");
      if (page) params.set("page", page);

      const url = `${ANTHROPIC_API}/v1/organizations/cost_report?${params.toString()}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": adminApiKey,
          "anthropic-version": "2023-06-01",
          "User-Agent": "freelancer-onboarding/ai-usage",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
      });

      const text = await res.text();
      let json: unknown;
      try {
        json = JSON.parse(text) as unknown;
      } catch {
        return {
          ok: false,
          errorMessage: `Anthropic API returned non-JSON (HTTP ${res.status}).`,
          polledAt,
        };
      }

      if (!res.ok) {
        const msg = parseAnthropicErrorMessage(json) ?? text.slice(0, 240);
        return {
          ok: false,
          errorMessage: `HTTP ${res.status}: ${msg}`,
          polledAt,
        };
      }

      const parsed = json as {
        data?: Array<{ results?: Array<{ amount?: string }> }>;
        has_more?: boolean;
        next_page?: string;
      };

      for (const bucket of parsed.data ?? []) {
        for (const row of bucket.results ?? []) {
          const a = row.amount;
          if (a == null) continue;
          const n = Number.parseFloat(String(a));
          if (Number.isFinite(n)) totalCents += n;
        }
      }

      page = parsed.has_more && parsed.next_page ? parsed.next_page : undefined;
    } while (page);

    return { ok: true, totalUsd: totalCents / 100, polledAt };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, errorMessage: msg, polledAt };
  }
}
