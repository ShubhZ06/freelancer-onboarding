import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { AiUsageCredentials } from "@/lib/ai-usage/types";
import {
  isSecureCookieEnabled,
  mergeCredentials,
  parseCredentialsFromUnknown,
} from "@/lib/ai-usage/credentials";
import { getAiUsageDashboard } from "@/lib/ai-usage/aggregate";
import { AI_USAGE_COOKIE_NAME, unsealCredentials } from "@/lib/ai-usage/secure-cookie";

const privateNoStore = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
} as const;

async function credentialsFromCookie(): Promise<AiUsageCredentials> {
  if (!isSecureCookieEnabled()) return {};
  const secret = process.env.AI_USAGE_CREDENTIALS_SECRET!.trim();
  const jar = await cookies();
  const raw = jar.get(AI_USAGE_COOKIE_NAME)?.value;
  if (!raw) return {};
  return unsealCredentials(raw, secret) ?? {};
}

/**
 * Unified AI usage snapshot. GET uses httpOnly cookie (if configured) only.
 * POST merges JSON body.credentials on top of the cookie (for localStorage clients).
 */
export async function GET(req: NextRequest) {
  const bypass = req.nextUrl.searchParams.get("refresh") === "1";
  try {
    const merged = mergeCredentials(await credentialsFromCookie(), {});
    const payload = await getAiUsageDashboard({ bypassCache: bypass, credentials: merged });
    return NextResponse.json(payload, { headers: privateNoStore });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Failed to aggregate AI usage", detail: message },
      { status: 500, headers: privateNoStore }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const bypass = body.refresh === true;
  try {
    const fromBody = parseCredentialsFromUnknown(body.credentials);
    const merged = mergeCredentials(await credentialsFromCookie(), fromBody);
    const payload = await getAiUsageDashboard({ bypassCache: bypass, credentials: merged });
    return NextResponse.json(payload, { headers: privateNoStore });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Failed to aggregate AI usage", detail: message },
      { status: 500, headers: privateNoStore }
    );
  }
}
