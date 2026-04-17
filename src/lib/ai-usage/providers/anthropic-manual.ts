import type { AiUsageCredentials, NormalizedUsageRow } from "../types";
import { healthFromPercent } from "../thresholds";

function parseNum(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function pickModels(creds: AiUsageCredentials): string | null {
  const fromCreds = creds.anthropicModelsInUse?.trim();
  if (fromCreds) return fromCreds;
  const fromEnv = process.env.ANTHROPIC_MODELS_IN_USE?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : null;
}

function pickApproxSpend(creds: AiUsageCredentials): number | null {
  if (creds.anthropicApproxSpendUsd != null && Number.isFinite(creds.anthropicApproxSpendUsd)) {
    return creds.anthropicApproxSpendUsd;
  }
  return parseNum(process.env.ANTHROPIC_APPROX_SPEND_USD);
}

function pickApproxBudget(creds: AiUsageCredentials): number | null {
  if (creds.anthropicApproxBudgetUsd != null && Number.isFinite(creds.anthropicApproxBudgetUsd)) {
    return creds.anthropicApproxBudgetUsd;
  }
  return parseNum(process.env.ANTHROPIC_APPROX_BUDGET_USD);
}

function pickUsedLegacy(creds: AiUsageCredentials): number | null {
  if (creds.anthropicClaudeUsed != null && Number.isFinite(creds.anthropicClaudeUsed)) {
    return creds.anthropicClaudeUsed;
  }
  return parseNum(process.env.ANTHROPIC_CLAUDE_USED);
}

function pickLimitLegacy(creds: AiUsageCredentials): number | null {
  if (creds.anthropicClaudeLimit != null && Number.isFinite(creds.anthropicClaudeLimit)) {
    return creds.anthropicClaudeLimit;
  }
  return parseNum(process.env.ANTHROPIC_CLAUDE_LIMIT);
}

function pickResetAt(creds: AiUsageCredentials): string | null {
  const fromCreds = creds.anthropicResetAtIso?.trim();
  if (fromCreds) return fromCreds;
  const fromEnv = process.env.ANTHROPIC_RESET_AT_ISO?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : null;
}

function formatResetLine(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return `Reset: ${iso.slice(0, 80)}`;
  return `Resets: ${d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`;
}

function summarizeModels(text: string, maxLen: number): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen - 1)}…`;
}

/**
 * Claude: list models in use (no Console quota required). Optional rough USD spend vs comfort budget for a bar.
 * Legacy: used/limit/reset still supported for older saved credentials.
 */
export function buildAnthropicManualRow(
  warnPercent: number,
  criticalPercent: number,
  creds: AiUsageCredentials = {}
): NormalizedUsageRow {
  const polledAt = new Date().toISOString();
  const models = pickModels(creds);
  const spend = pickApproxSpend(creds);
  const budget = pickApproxBudget(creds);

  if (models) {
    const secondaryParts: string[] = [];
    let percent: number | null = null;
    let health: NormalizedUsageRow["health"] = "ok";

    if (spend != null && budget != null && budget > 0) {
      percent = Math.min(100, (spend / budget) * 100);
      health = healthFromPercent(percent, warnPercent, criticalPercent);
      secondaryParts.push(
        `~$${spend.toFixed(2)} / $${budget.toFixed(2)} comfort budget · ${percent.toFixed(1)}%`
      );
    } else {
      secondaryParts.push("Add optional rough spend + comfort budget below for a progress bar.");
    }

    return {
      providerId: "anthropic_claude",
      displayName: "Claude (Anthropic)",
      percentOfLimit: percent,
      syntheticPercent: null,
      limitLabel: budget != null && budget > 0 ? `$${budget.toFixed(2)} / mo (comfort)` : null,
      displayPrimary: summarizeModels(models, 96),
      displaySecondary: secondaryParts.join(" "),
      health,
      sourceStatus: "manual_env",
      detail: models.length > 96 ? models : null,
      polledAt,
    };
  }

  const used = pickUsedLegacy(creds);
  const limit = pickLimitLegacy(creds);
  const resetIso = pickResetAt(creds);
  const resetLine = formatResetLine(resetIso);

  if (used == null || limit == null || limit <= 0) {
    return {
      providerId: "anthropic_claude",
      displayName: "Claude (Anthropic)",
      percentOfLimit: null,
      syntheticPercent: null,
      limitLabel: null,
      displayPrimary: "Claude not tracked",
      displaySecondary:
        "List models you use below (e.g. claude-sonnet-4, Cursor Claude), or set legacy ANTHROPIC_CLAUDE_* env vars.",
      health: "unknown",
      sourceStatus: "skipped",
      detail: null,
      polledAt,
    };
  }

  const percentLegacy = Math.min(100, (used / limit) * 100);
  const secondaryParts = [`${percentLegacy.toFixed(1)}% of limit (legacy)`, resetLine].filter(Boolean);

  return {
    providerId: "anthropic_claude",
    displayName: "Claude (Anthropic, legacy quota)",
    percentOfLimit: percentLegacy,
    syntheticPercent: null,
    limitLabel: `${used} / ${limit} (used / limit)`,
    displayPrimary: `${percentLegacy.toFixed(1)}% used`,
    displaySecondary: secondaryParts.join(" · "),
    health: healthFromPercent(percentLegacy, warnPercent, criticalPercent),
    sourceStatus: "manual_env",
    detail: null,
    polledAt,
  };
}
