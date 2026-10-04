import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/mongodb";
import type { AuthUser } from "@/lib/auth-session";
import { readJsonBody } from "@/lib/http/read-json-body";

export const runtime = "nodejs";

type UpdateProfileBody = AuthUser;

export async function POST(req: NextRequest) {
  const parsed = await readJsonBody<UpdateProfileBody>(req);
  if (!parsed.ok) return parsed.response;

  const {
    name,
    email,
    location,
    phoneNumber,
    businessName,
    businessLocation,
    businessRegistrationNumber,
  } = parsed.data;

  const normalizedEmail = email.trim().toLowerCase();

  const db = await getDb();
  if (!db) {
    return NextResponse.json(
      { success: false, message: "Database unavailable — cannot update profile." },
      { status: 503 }
    );
  }

  const result = await db.collection("users").findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        name: name.trim(),
        location: location?.trim(),
        phoneNumber: phoneNumber?.trim(),
        businessName: businessName?.trim(),
        businessLocation: businessLocation?.trim(),
        businessRegistrationNumber: businessRegistrationNumber?.trim(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json(
      { success: false, message: "User not found. Please sign in again." },
      { status: 404 }
    );
  }

  const user: AuthUser = {
    name: result.name as string,
    email: result.email as string,
    location: result.location as string | undefined,
    phoneNumber: result.phoneNumber as string | undefined,
    businessName: result.businessName as string | undefined,
    businessLocation: result.businessLocation as string | undefined,
    businessRegistrationNumber: result.businessRegistrationNumber as string | undefined,
  };

  return NextResponse.json({ success: true, user });
}
