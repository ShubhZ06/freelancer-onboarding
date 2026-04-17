import type { AiUsageCredentials, NormalizedUsageRow } from "../types";
import { healthFromPercent } from "../thresholds";

function monthRangeIso(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

function pickBudgetUsd(creds: AiUsageCredentials): number {
  const budgetEnv = Number.parseFloat(process.env.OPENAI_MONTHLY_BUDGET_USD ?? "");
  const budgetCreds = creds.openaiMonthlyBudgetUsd;
  if (budgetCreds != null && Number.isFinite(budgetCreds) && budgetCreds > 0) return budgetCreds;
  if (Number.isFinite(budgetEnv) && budgetEnv > 0) return budgetEnv;
  return NaN;
}

function pickManualSpend(creds: AiUsageCredentials): number | null {
  const fromCreds = creds.openaiManualSpendUsd;
  if (fromCreds != null && Number.isFinite(fromCreds) && fromCreds >= 0) return fromCreds;
  const fromEnv = Number.parseFloat(process.env.OPENAI_MANUAL_SPEND_USD ?? "");
  if (Number.isFinite(fromEnv) && fromEnv >= 0) return fromEnv;
  return null;
}

function manualSpendRow(
  spentUsd: number,
  budgetUsd: number,
  warnPercent: number,
  criticalPercent: number,
  polledAt: string
): NormalizedUsageRow {
  const limit = Number.isFinite(budgetUsd) && budgetUsd > 0 ? budgetUsd : null;
  const percentOfLimit = limit != null ? Math.min(100, (spentUsd / limit) * 100) : null;
  return {
    providerId: "openai",
    displayName: "OpenAI",
    percentOfLimit,
    syntheticPercent: limit == null ? Math.min(100, spentUsd) : null,
    limitLabel: limit != null ? `$${limit.toFixed(2)} / mo budget` : "Set monthly budget for %",
    displayPrimary: `$${spentUsd.toFixed(2)} (manual)`,
    displaySecondary:
      "Secret API keys cannot call OpenAI’s dashboard billing URL (403). Spend is from the number you entered; update it from platform.openai.com → Billing when you like.",
    health: healthFromPercent(percentOfLimit, warnPercent, criticalPercent),
    sourceStatus: "manual_env",
    detail: null,
    polledAt,
  };
}

/**
 * Tries OpenAI dashboard billing usage (often 403 for sk- keys). Falls back to
 * openaiManualSpendUsd / OPENAI_MANUAL_SPEND_USD for the progress bar.
 */
export async function fetchOpenAiUsageRow(
  warnPercent: number,
  criticalPercent: number,
  creds: AiUsageCredentials = {}
): Promise<NormalizedUsageRow> {
  const polledAt = new Date().toISOString();
  const apiKey = (creds.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim()) ?? "";
  const budgetUsd = pickBudgetUsd(creds);
  const manualSpend = pickManualSpend(creds);

  if (!apiKey) {
    return {
      providerId: "openai",
      displayName: "OpenAI",
      percentOfLimit: null,
      syntheticPercent: null,
      limitLabel: Number.isFinite(budgetUsd) ? `$${budgetUsd.toFixed(0)} / mo budget` : null,
      displayPrimary: "Not configured",
      displaySecondary:
        "Add an API key below (or httpOnly cookie) or set OPENAI_API_KEY on the server.",
      health: "unknown",
      sourceStatus: "skipped",
      detail: null,
      polledAt,
    };
  }

  const { start, end } = monthRangeIso();
  const url = `https://api.openai.com/v1/dashboard/billing/usage?start_date=${start}&end_date=${end}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (manualSpend != null) {
        return manualSpendRow(
          manualSpend,
          budgetUsd,
          warnPercent,
          criticalPercent,
          polledAt
        );
      }
      return {
        providerId: "openai",
        displayName: "OpenAI",
        percentOfLimit: null,
        syntheticPercent: null,
        limitLabel: null,
        displayPrimary: `HTTP ${res.status}`,
        displaySecondary:
          "OpenAI only allows this billing URL with a browser session key, not a secret (sk-) key. Fix: add “OpenAI spend this month (USD)” in the form below (from your Billing page), or ignore this row.",
        health: "unknown",
        sourceStatus: "error",
        detail: body.slice(0, 280) || res.statusText,
        polledAt,
      };
    }

    const data = (await res.json()) as { total_usage?: number };
    const cents = typeof data.total_usage === "number" ? data.total_usage : 0;
    const spentUsd = cents / 100;

    const limit = Number.isFinite(budgetUsd) ? budgetUsd : null;
    const percentOfLimit = limit != null ? Math.min(100, (spentUsd / limit) * 100) : null;

    return {
      providerId: "openai",
      displayName: "OpenAI",
      percentOfLimit,
      syntheticPercent: limit == null ? Math.min(100, spentUsd) : null,
      limitLabel: limit != null ? `$${limit.toFixed(2)} / mo budget` : "No monthly budget set",
      displayPrimary: `$${spentUsd.toFixed(2)}`,
      displaySecondary: `${start} → ${end} (billing API, month to date)`,
      health: healthFromPercent(percentOfLimit, warnPercent, criticalPercent),
      sourceStatus: "live",
      detail: null,
      polledAt,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (manualSpend != null) {
      return manualSpendRow(manualSpend, budgetUsd, warnPercent, criticalPercent, polledAt);
    }
    return {
      providerId: "openai",
      displayName: "OpenAI",
      percentOfLimit: null,
      syntheticPercent: null,
      limitLabel: null,
      displayPrimary: "Request failed",
      displaySecondary: msg,
      health: "unknown",
      sourceStatus: "error",
      detail: msg,
      polledAt,
    };
  }
}
