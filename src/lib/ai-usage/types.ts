/** User-supplied or env-backed fields; never log. */
export type AiUsageCredentials = {
  openaiApiKey?: string;
  openaiMonthlyBudgetUsd?: number;
  /** When billing API rejects sk keys (403), use this for the progress bar (USD this month). */
  openaiManualSpendUsd?: number;
  cursorFastRequestsUsed?: number;
  cursorFastRequestsLimit?: number;
  geminiCloudSpendUsd?: number;
  geminiCloudBudgetUsd?: number;
  /**
   * Anthropic Admin API key (sk-ant-admin…) — enables live monthly cost from `/v1/organizations/cost_report`.
   * Org-only; create in Claude Console → Admin API keys.
   */
  anthropicAdminApiKey?: string;
  /** Claude / Anthropic models you use (free text; no Console quota required). */
  anthropicModelsInUse?: string;
  /** Optional rough USD this month vs comfort budget — drives % bar when both set. */
  anthropicApproxSpendUsd?: number;
  anthropicApproxBudgetUsd?: number;
  /** @deprecated Prefer anthropicModelsInUse + optional spend/budget. */
  anthropicClaudeUsed?: number;
  anthropicClaudeLimit?: number;
  anthropicResetAtIso?: string;
};

export type UsageHealth = "ok" | "warn" | "critical" | "unknown";

export type UsageSourceStatus = "live" | "manual_env" | "demo" | "error" | "skipped";

/** Single provider row after normalization (comparable progress when limit known). */
export type NormalizedUsageRow = {
  providerId: string;
  displayName: string;
  /** What the UI progress bar represents (0–100 when limit is set). */
  percentOfLimit: number | null;
  /** Primary number for the bar when no limit (0–100 synthetic from fraction of soft cap). */
  syntheticPercent: number | null;
  limitLabel: string | null;
  displayPrimary: string;
  displaySecondary: string | null;
  health: UsageHealth;
  sourceStatus: UsageSourceStatus;
  detail: string | null;
  polledAt: string;
};

/** Safe subset for repopulating the form (never includes API keys). */
export type AiUsageDashboardMeta = {
  secureCookieEnabled: boolean;
  credentialsConfigured: boolean;
  hasOpenAiKey: boolean;
  hasAnthropicAdminKey: boolean;
  openaiMonthlyBudgetUsd: number | null;
  openaiManualSpendUsd: number | null;
  cursorFastRequestsUsed: number | null;
  cursorFastRequestsLimit: number | null;
  geminiCloudSpendUsd: number | null;
  geminiCloudBudgetUsd: number | null;
  anthropicModelsInUse: string | null;
  anthropicApproxSpendUsd: number | null;
  anthropicApproxBudgetUsd: number | null;
  anthropicClaudeUsed: number | null;
  anthropicClaudeLimit: number | null;
  anthropicResetAtIso: string | null;
};

export type AiUsageDashboardPayload = {
  generatedAt: string;
  cache: {
    hit: boolean;
    ttlSeconds: number;
    ageSeconds: number | null;
  };
  warnPercent: number;
  criticalPercent: number;
  providers: NormalizedUsageRow[];
  aggregateHealth: UsageHealth;
  notes: string[];
  meta: AiUsageDashboardMeta;
};
