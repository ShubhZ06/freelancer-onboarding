import type { AiUsageCredentials, NormalizedUsageRow } from "../types";
import { healthFromPercent } from "../thresholds";
import { fetchAnthropicOrgCostMonthUsd } from "./anthropic-admin-api";
import { buildAnthropicManualRow } from "./anthropic-manual";

function pickAdminKey(creds: AiUsageCredentials): string {
  return (creds.anthropicAdminApiKey?.trim() || process.env.ANTHROPIC_ADMIN_API_KEY?.trim()) ?? "";
}

function pickComfortBudgetUsd(creds: AiUsageCredentials): number | null {
  const b = creds.anthropicApproxBudgetUsd;
  if (b != null && Number.isFinite(b) && b > 0) return b;
  const env = Number.parseFloat(process.env.ANTHROPIC_APPROX_BUDGET_USD ?? "");
  return Number.isFinite(env) && env > 0 ? env : null;
}

function buildLiveCostRow(
  warnPercent: number,
  criticalPercent: number,
  creds: AiUsageCredentials,
  spendUsd: number,
  polledAt: string
): NormalizedUsageRow {
  const budget = pickComfortBudgetUsd(creds);
  let percent: number | null = null;
  let health: NormalizedUsageRow["health"] = "ok";
  if (budget != null) {
    percent = Math.min(100, (spendUsd / budget) * 100);
    health = healthFromPercent(percent, warnPercent, criticalPercent);
  }

  const models = creds.anthropicModelsInUse?.trim();
  const parts: string[] = [
    "Month-to-date (UTC) via Anthropic Cost API — data usually within ~5 minutes of usage.",
  ];
  if (models) {
    const short = models.length > 140 ? `${models.slice(0, 139)}…` : models;
    parts.push(`Your model note: ${short}`);
  }
  if (budget == null) {
    parts.push("Set a comfort budget below for a % bar.");
  }

  return {
    providerId: "anthropic_claude",
    displayName: "Claude (Anthropic)",
    percentOfLimit: percent,
    syntheticPercent: null,
    limitLabel: budget != null ? `$${budget.toFixed(2)} / mo (comfort)` : null,
    displayPrimary: `$${spendUsd.toFixed(2)} this month (live)`,
    displaySecondary: parts.join(" "),
    health,
    sourceStatus: "live",
    detail: null,
    polledAt,
  };
}

/**
 * Live org cost when an Anthropic **Admin** API key is configured; otherwise manual / legacy row.
 */
export async function fetchAnthropicUsageRow(
  warnPercent: number,
  criticalPercent: number,
  creds: AiUsageCredentials = {}
): Promise<NormalizedUsageRow> {
  const adminKey = pickAdminKey(creds);
  if (!adminKey) {
    return buildAnthropicManualRow(warnPercent, criticalPercent, creds);
  }

  const result = await fetchAnthropicOrgCostMonthUsd(adminKey);
  if (result.ok) {
    return buildLiveCostRow(warnPercent, criticalPercent, creds, result.totalUsd, result.polledAt);
  }

  return {
    providerId: "anthropic_claude",
    displayName: "Claude (Anthropic)",
    percentOfLimit: null,
    syntheticPercent: null,
    limitLabel: null,
    displayPrimary: "Anthropic Admin API failed",
    displaySecondary: result.errorMessage,
    health: "unknown",
    sourceStatus: "error",
    detail:
      "Use an Admin API key (sk-ant-admin…) from Claude Console → Admin API keys. Standard API keys cannot call the cost report.",
    polledAt: result.polledAt,
  };
}
