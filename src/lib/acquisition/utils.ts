const FETCH_TIMEOUT_MS = 15_000;

// ─── Simple in-process TTL cache ─────────────────────────────────────────────
// Used by bulk connectors (Arbeitnow, Remotive, Remote OK) that always return
// the full dataset and are filtered locally. Avoids re-downloading 400-600 KB
// on every search and prevents spurious timeouts on repeat requests.

type CacheEntry<T> = { value: T; expiresAt: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = _cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  _cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesQuery(
  title: string,
  description: string,
  q: string,
): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = `${title}\n${description}`.toLowerCase();
  return hay.includes(s);
}

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export function parsePage(raw: string | null, max = 50): number {
  const n = parseInt(raw ?? "1", 10);
  return Number.isFinite(n) ? Math.min(Math.max(1, n), max) : 1;
}
