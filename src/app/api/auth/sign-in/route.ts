import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/mongodb";
import type { AuthUser } from "@/lib/auth-session";
import { readJsonBody } from "@/lib/http/read-json-body";

export const runtime = "nodejs";

type SignInBody = { email: string; password: string };

export async function POST(req: NextRequest) {
  const parsed = await readJsonBody<SignInBody>(req);
  if (!parsed.ok) return parsed.response;

  const { email, password } = parsed.data;

  const normalizedEmail = email.trim().toLowerCase();

  const db = await getDb();
  if (!db) {
    return NextResponse.json(
      { success: false, message: "Database unavailable — cannot sign in. Check MONGODB_URI." },
      { status: 503 }
    );
  }

  const stored = await db.collection<AuthUser & { password: string; createdAt: Date }>("users").findOne(
    { email: normalizedEmail }
  );

  if (!stored) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, stored.password);
  if (!valid) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 }
    );
  }

  // Return user without the password hash
  const user: AuthUser = {
    name: stored.name,
    email: stored.email,
    location: stored.location,
    phoneNumber: stored.phoneNumber,
    businessName: stored.businessName,
    businessLocation: stored.businessLocation,
    businessRegistrationNumber: stored.businessRegistrationNumber,
  };

  return NextResponse.json({ success: true, user });
}
