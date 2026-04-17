const FETCH_TIMEOUT_MS = 9_000;

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
