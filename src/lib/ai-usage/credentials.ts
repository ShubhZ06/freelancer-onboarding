import { createHash } from "node:crypto";
import type { AiUsageCredentials } from "./types";

const MAX_KEY_LEN = 512;
const MAX_MODELS_NOTE_LEN = 2000;

function trimStr(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.slice(0, MAX_KEY_LEN).trim();
  return t.length > 0 ? t : undefined;
}

function optNum(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return clampNum(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number.parseFloat(v);
    if (Number.isFinite(n)) return clampNum(n);
  }
  return undefined;
}

function trimModelsNote(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.replace(/\r\n/g, "\n").slice(0, MAX_MODELS_NOTE_LEN).trim();
  return t.length > 0 ? t : undefined;
}

function clampNum(n: number): number {
  if (n > 1e12) return 1e12;
  if (n < -1e12) return -1e12;
  return n;
}

/** Sanitize and drop empty fields. */
export function sanitizeCredentials(input: AiUsageCredentials): AiUsageCredentials {
  const out: AiUsageCredentials = {};
  const k = input.openaiApiKey != null ? trimStr(input.openaiApiKey) : undefined;
  if (k) out.openaiApiKey = k;
  const aa = input.anthropicAdminApiKey != null ? trimStr(input.anthropicAdminApiKey) : undefined;
  if (aa) out.anthropicAdminApiKey = aa;
  const b = input.openaiMonthlyBudgetUsd;
  if (b != null && Number.isFinite(b) && b >= 0) out.openaiMonthlyBudgetUsd = clampNum(b);
  const ms = input.openaiManualSpendUsd;
  if (ms != null && Number.isFinite(ms) && ms >= 0) out.openaiManualSpendUsd = clampNum(ms);
  const cu = input.cursorFastRequestsUsed;
  if (cu != null && Number.isFinite(cu) && cu >= 0) out.cursorFastRequestsUsed = Math.floor(cu);
  const cl = input.cursorFastRequestsLimit;
  if (cl != null && Number.isFinite(cl) && cl > 0) out.cursorFastRequestsLimit = Math.floor(cl);
  const gs = input.geminiCloudSpendUsd;
  if (gs != null && Number.isFinite(gs) && gs >= 0) out.geminiCloudSpendUsd = clampNum(gs);
  const gb = input.geminiCloudBudgetUsd;
  if (gb != null && Number.isFinite(gb) && gb > 0) out.geminiCloudBudgetUsd = clampNum(gb);
  const am = input.anthropicModelsInUse != null ? trimModelsNote(input.anthropicModelsInUse) : undefined;
  if (am) out.anthropicModelsInUse = am;
  const aas = input.anthropicApproxSpendUsd;
  if (aas != null && Number.isFinite(aas) && aas >= 0) out.anthropicApproxSpendUsd = clampNum(aas);
  const aab = input.anthropicApproxBudgetUsd;
  if (aab != null && Number.isFinite(aab) && aab > 0) out.anthropicApproxBudgetUsd = clampNum(aab);
  const au = input.anthropicClaudeUsed;
  if (au != null && Number.isFinite(au) && au >= 0) out.anthropicClaudeUsed = clampNum(au);
  const al = input.anthropicClaudeLimit;
  if (al != null && Number.isFinite(al) && al > 0) out.anthropicClaudeLimit = clampNum(al);
  const ar = input.anthropicResetAtIso != null ? trimStr(input.anthropicResetAtIso) : undefined;
  if (ar) out.anthropicResetAtIso = ar.slice(0, 80);
  return out;
}

export function parseCredentialsFromUnknown(raw: unknown): AiUsageCredentials {
  if (raw == null || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return sanitizeCredentials({
    openaiApiKey: trimStr(o.openaiApiKey),
    anthropicAdminApiKey: trimStr(o.anthropicAdminApiKey),
    openaiMonthlyBudgetUsd: optNum(o.openaiMonthlyBudgetUsd),
    openaiManualSpendUsd: optNum(o.openaiManualSpendUsd),
    cursorFastRequestsUsed: optNum(o.cursorFastRequestsUsed),
    cursorFastRequestsLimit: optNum(o.cursorFastRequestsLimit),
    geminiCloudSpendUsd: optNum(o.geminiCloudSpendUsd),
    geminiCloudBudgetUsd: optNum(o.geminiCloudBudgetUsd),
    anthropicModelsInUse: trimModelsNote(o.anthropicModelsInUse),
    anthropicApproxSpendUsd: optNum(o.anthropicApproxSpendUsd),
    anthropicApproxBudgetUsd: optNum(o.anthropicApproxBudgetUsd),
    anthropicClaudeUsed: optNum(o.anthropicClaudeUsed),
    anthropicClaudeLimit: optNum(o.anthropicClaudeLimit),
    anthropicResetAtIso: trimStr(o.anthropicResetAtIso),
  });
}

export function mergeCredentials(
  base: AiUsageCredentials,
  override: AiUsageCredentials
): AiUsageCredentials {
  return { ...base, ...override };
}

/** Stable cache partition. */
export function credentialsCacheKey(creds: AiUsageCredentials): string {
  const c = sanitizeCredentials(creds);
  const keys = Object.keys(c).sort() as (keyof AiUsageCredentials)[];
  const payload = keys.map((k) => `${String(k)}:${String(c[k])}`).join("|");
  if (payload === "") return "__env_only__";
  return createHash("sha256").update(payload).digest("hex").slice(0, 24);
}

export function credentialsConfigured(creds: AiUsageCredentials): boolean {
  return Object.keys(sanitizeCredentials(creds)).length > 0;
}

/** httpOnly cookie storage requires a long random server secret. */
export function isSecureCookieEnabled(): boolean {
  const s = process.env.AI_USAGE_CREDENTIALS_SECRET?.trim();
  return !!s && s.length >= 32;
}
