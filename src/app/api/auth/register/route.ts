import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/mongodb";
import type { AuthUser } from "@/lib/auth-session";
import { readJsonBody } from "@/lib/http/read-json-body";

export const runtime = "nodejs";

type RegisterBody = AuthUser & { password: string };

export async function POST(req: NextRequest) {
  const parsed = await readJsonBody<RegisterBody>(req);
  if (!parsed.ok) return parsed.response;

  const {
    name,
    email,
    location,
    phoneNumber,
    password,
    businessName,
    businessLocation,
    businessRegistrationNumber,
  } = parsed.data;

  const normalizedEmail = email.trim().toLowerCase();

  const db = await getDb();
  if (!db) {
    return NextResponse.json(
      { success: false, message: "Database unavailable — cannot register user. Check MONGODB_URI." },
      { status: 503 }
    );
  }

  const existing = await db.collection("users").findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json(
      { success: false, message: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user: AuthUser = {
    name: name.trim(),
    email: normalizedEmail,
    location: location?.trim(),
    phoneNumber: phoneNumber?.trim(),
    businessName: businessName?.trim(),
    businessLocation: businessLocation?.trim(),
    businessRegistrationNumber: businessRegistrationNumber?.trim(),
  };

  await db.collection("users").insertOne({
    ...user,
    password: hashedPassword,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, user }, { status: 201 });
}
