import type { AiUsageCredentials } from "../types";
import type { NormalizedUsageRow } from "../types";
import { healthFromPercent } from "../thresholds";

function parseNum(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function pickSpend(creds: AiUsageCredentials): number | null {
  if (creds.geminiCloudSpendUsd != null && Number.isFinite(creds.geminiCloudSpendUsd)) {
    return creds.geminiCloudSpendUsd;
  }
  return parseNum(process.env.GEMINI_CLOUD_SPEND_USD);
}

function pickBudget(creds: AiUsageCredentials): number | null {
  if (creds.geminiCloudBudgetUsd != null && Number.isFinite(creds.geminiCloudBudgetUsd)) {
    return creds.geminiCloudBudgetUsd;
  }
  return parseNum(process.env.GEMINI_CLOUD_BUDGET_USD);
}

/**
 * Gemini / GCP spend from saved credentials or env until Billing API is wired.
 */
export function buildGeminiCloudManualRow(
  warnPercent: number,
  criticalPercent: number,
  creds: AiUsageCredentials = {}
): NormalizedUsageRow {
  const polledAt = new Date().toISOString();
  const spend = pickSpend(creds);
  const budget = pickBudget(creds);

  if (spend == null || budget == null || budget <= 0) {
    return {
      providerId: "gemini_cloud",
      displayName: "Gemini / GCP (manual)",
      percentOfLimit: null,
      syntheticPercent: null,
      limitLabel: null,
      displayPrimary: "Cloud spend not set",
      displaySecondary: "Enter monthly spend/budget below or set GEMINI_CLOUD_* env vars.",
      health: "unknown",
      sourceStatus: "skipped",
      detail: null,
      polledAt,
    };
  }

  const percent = Math.min(100, (spend / budget) * 100);

  return {
    providerId: "gemini_cloud",
    displayName: "Gemini / GCP (manual)",
    percentOfLimit: percent,
    syntheticPercent: null,
    limitLabel: `$${budget.toFixed(2)} / mo budget`,
    displayPrimary: `$${spend.toFixed(2)} spent`,
    displaySecondary: "Manual monthly snapshot (replace with Billing API later).",
    health: healthFromPercent(percent, warnPercent, criticalPercent),
    sourceStatus: "manual_env",
    detail: null,
    polledAt,
  };
}
