import {
  credentialsCacheKey,
  credentialsConfigured,
  isSecureCookieEnabled,
  sanitizeCredentials,
} from "./credentials";
import type {
  AiUsageCredentials,
  AiUsageDashboardMeta,
  AiUsageDashboardPayload,
  NormalizedUsageRow,
  UsageHealth,
} from "./types";
import { clearCacheKey, getCacheTtlMs, readCache, writeCache } from "./cache";
import { worstHealth } from "./thresholds";
import { fetchOpenAiUsageRow } from "./providers/openai";
import { buildCursorManualRow } from "./providers/cursor-manual";
import { buildGeminiCloudManualRow } from "./providers/gemini-manual";
import { fetchAnthropicUsageRow } from "./providers/anthropic";

function parseThreshold(name: string, fallback: number): number {
  const n = Number.parseFloat(process.env[name] ?? "");
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : fallback;
}

function buildMeta(creds: AiUsageCredentials): AiUsageDashboardMeta {
  const s = sanitizeCredentials(creds);
  return {
    secureCookieEnabled: isSecureCookieEnabled(),
    credentialsConfigured: credentialsConfigured(s),
    hasOpenAiKey: !!s.openaiApiKey,
    hasAnthropicAdminKey: !!s.anthropicAdminApiKey,
    openaiMonthlyBudgetUsd: s.openaiMonthlyBudgetUsd ?? null,
    openaiManualSpendUsd: s.openaiManualSpendUsd ?? null,
    cursorFastRequestsUsed: s.cursorFastRequestsUsed ?? null,
    cursorFastRequestsLimit: s.cursorFastRequestsLimit ?? null,
    geminiCloudSpendUsd: s.geminiCloudSpendUsd ?? null,
    geminiCloudBudgetUsd: s.geminiCloudBudgetUsd ?? null,
    anthropicModelsInUse: s.anthropicModelsInUse ?? null,
    anthropicApproxSpendUsd: s.anthropicApproxSpendUsd ?? null,
    anthropicApproxBudgetUsd: s.anthropicApproxBudgetUsd ?? null,
    anthropicClaudeUsed: s.anthropicClaudeUsed ?? null,
    anthropicClaudeLimit: s.anthropicClaudeLimit ?? null,
    anthropicResetAtIso: s.anthropicResetAtIso ?? null,
  };
}

async function buildFreshPayload(credentials: AiUsageCredentials): Promise<AiUsageDashboardPayload> {
  const creds = sanitizeCredentials(credentials);
  const warnPercent = parseThreshold("AI_USAGE_WARN_PERCENT", 75);
  const criticalPercent = parseThreshold("AI_USAGE_CRITICAL_PERCENT", 90);
  const notes: string[] = [
    "Provider calls run on this server only; third parties never see your browser.",
    isSecureCookieEnabled()
      ? "Credentials can be stored in an httpOnly encrypted cookie (set AI_USAGE_CREDENTIALS_SECRET, min 32 chars)."
      : "Set AI_USAGE_CREDENTIALS_SECRET (32+ random chars) to enable httpOnly encrypted cookie storage instead of localStorage.",
    "Billing APIs can be slow — results are TTL-cached per credential bundle.",
    "localStorage mode: keys stay in your browser (XSS can read them). Prefer httpOnly mode in production.",
    "Claude live cost uses Anthropic’s org Cost API (Admin API key sk-ant-admin…). Data is usually fresh within ~5 minutes.",
  ];

  const [openai, cursor, gemini, claude] = await Promise.all([
    fetchOpenAiUsageRow(warnPercent, criticalPercent, creds),
    Promise.resolve(buildCursorManualRow(warnPercent, criticalPercent, creds)),
    Promise.resolve(buildGeminiCloudManualRow(warnPercent, criticalPercent, creds)),
    fetchAnthropicUsageRow(warnPercent, criticalPercent, creds),
  ]);

  const providers: NormalizedUsageRow[] = [openai, cursor, gemini, claude];

  const considered = providers.filter((p) => p.sourceStatus !== "skipped");
  let aggregateHealth: UsageHealth = considered.length === 0 ? "unknown" : "ok";
  for (const p of considered) {
    aggregateHealth = worstHealth(aggregateHealth, p.health);
  }

  const generatedAt = new Date().toISOString();
  const ttlSeconds = Math.round(getCacheTtlMs() / 1000);

  return {
    generatedAt,
    cache: { hit: false, ttlSeconds, ageSeconds: 0 },
    warnPercent,
    criticalPercent,
    providers,
    aggregateHealth,
    notes,
    meta: buildMeta(creds),
  };
}

export async function getAiUsageDashboard(options: {
  bypassCache?: boolean;
  credentials?: AiUsageCredentials;
}): Promise<AiUsageDashboardPayload> {
  const creds = sanitizeCredentials(options.credentials ?? {});
  const cacheKey = credentialsCacheKey(creds);

  if (options.bypassCache) {
    clearCacheKey(cacheKey);
  }

  const cached = readCache(cacheKey);
  if (cached) {
    const ageSeconds = Math.round((Date.now() - cached.storedAt) / 1000);
    const freshMeta = buildMeta(creds);
    return {
      ...cached.payload,
      meta: freshMeta,
      cache: {
        hit: true,
        ttlSeconds: Math.round(getCacheTtlMs() / 1000),
        ageSeconds,
      },
    };
  }

  const fresh = await buildFreshPayload(creds);
  writeCache(cacheKey, fresh);
  return fresh;
}
