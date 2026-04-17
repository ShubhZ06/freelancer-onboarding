import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { AiUsageCredentials } from "@/lib/ai-usage/types";
import {
  isSecureCookieEnabled,
  mergeCredentials,
  parseCredentialsFromUnknown,
  sanitizeCredentials,
} from "@/lib/ai-usage/credentials";
import { clearAllUsageCache } from "@/lib/ai-usage/cache";
import { AI_USAGE_COOKIE_NAME, sealCredentials, unsealCredentials } from "@/lib/ai-usage/secure-cookie";

const privateNoStore = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
} as const;

/**
 * Save merged credentials into an httpOnly AES-GCM cookie (requires AI_USAGE_CREDENTIALS_SECRET).
 * Body: { credentials?: object, clearOpenAiApiKey?: boolean, clearAnthropicAdminApiKey?: boolean }
 */
export async function POST(req: NextRequest) {
  if (!isSecureCookieEnabled()) {
    return NextResponse.json(
      {
        error: "Set AI_USAGE_CREDENTIALS_SECRET (32+ random characters) on the server for httpOnly storage.",
      },
      { status: 501, headers: privateNoStore }
    );
  }

  const secret = process.env.AI_USAGE_CREDENTIALS_SECRET!.trim();
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const jar = await cookies();
  const existingRaw = jar.get(AI_USAGE_COOKIE_NAME)?.value;
  let base: AiUsageCredentials = {};
  if (existingRaw) {
    const u = unsealCredentials(existingRaw, secret);
    if (u) base = u;
  }

  const patch = parseCredentialsFromUnknown(body.credentials);
  let next = mergeCredentials(base, patch);

  const rawCreds = body.credentials;
  if (rawCreds != null && typeof rawCreds === "object" && !Array.isArray(rawCreds)) {
    const o = rawCreds as Record<string, unknown>;
    if (Object.hasOwn(o, "anthropicModelsInUse")) {
      const v = o.anthropicModelsInUse;
      if (v === null || v === "" || (typeof v === "string" && v.trim() === "")) {
        delete next.anthropicModelsInUse;
      }
    }
  }

  if (body.clearOpenAiApiKey === true) {
    delete next.openaiApiKey;
  }

  if (body.clearAnthropicAdminApiKey === true) {
    delete next.anthropicAdminApiKey;
  }

  next = sanitizeCredentials(next);
  const sealed = sealCredentials(next, secret);

  jar.set(AI_USAGE_COOKIE_NAME, sealed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  clearAllUsageCache();

  return NextResponse.json({ success: true }, { headers: privateNoStore });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(AI_USAGE_COOKIE_NAME);
  clearAllUsageCache();
  return NextResponse.json({ success: true }, { headers: privateNoStore });
}
