import type { AiUsageDashboardPayload } from "./types";

type CacheEntry = { payload: AiUsageDashboardPayload; storedAt: number };

const globalForCache = globalThis as typeof globalThis & {
  __aiUsageDashboardCacheMap?: Map<string, CacheEntry>;
};

function getMap(): Map<string, CacheEntry> {
  if (!globalForCache.__aiUsageDashboardCacheMap) {
    globalForCache.__aiUsageDashboardCacheMap = new Map();
  }
  return globalForCache.__aiUsageDashboardCacheMap;
}

export function getCacheTtlMs(): number {
  const sec = Number.parseInt(process.env.AI_USAGE_CACHE_TTL_SECONDS ?? "600", 10);
  return Number.isFinite(sec) && sec > 0 ? sec * 1000 : 600_000;
}

export function readCache(cacheKey: string): CacheEntry | null {
  const map = getMap();
  const entry = map.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > getCacheTtlMs()) {
    map.delete(cacheKey);
    return null;
  }
  return entry;
}

export function writeCache(cacheKey: string, payload: AiUsageDashboardPayload): void {
  getMap().set(cacheKey, { payload, storedAt: Date.now() });
}

export function clearCacheKey(cacheKey: string): void {
  getMap().delete(cacheKey);
}

export function clearAllUsageCache(): void {
  getMap().clear();
}
