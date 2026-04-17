import { NextRequest, NextResponse } from "next/server";

export async function readJsonBody<T>(
  req: NextRequest
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const data = (await req.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 }),
    };
  }
}
