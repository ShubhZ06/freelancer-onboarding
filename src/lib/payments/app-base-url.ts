/**
 * Public site URL for Stripe redirect URLs (success / cancel).
 * Set NEXT_PUBLIC_APP_URL in production (e.g. https://yourdomain.com).
 */
export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:3000";
}
