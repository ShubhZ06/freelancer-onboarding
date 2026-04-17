import { NextRequest, NextResponse } from "next/server";
import { addClient, clientToWire, getClients } from "@/lib/demo-db";
import { readJsonBody } from "@/lib/http/read-json-body";

export function GET() {
  const clients = getClients().map(clientToWire);
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const parsed = await readJsonBody<{ name?: string; phone?: string }>(req);
  if (!parsed.ok) return parsed.response;

  const name = parsed.data.name?.trim();
  const rawPhone = parsed.data.phone?.trim();

  if (!name || !rawPhone) {
    return NextResponse.json({ success: false, error: "name and phone are required" }, { status: 422 });
  }

  const digits = rawPhone.replace(/^\+/, "").replace(/\D/g, "");
  if (digits.length < 10) {
    return NextResponse.json(
      { success: false, error: "enter a valid mobile number (with country code)" },
      { status: 422 }
    );
  }

  const phone = `+${digits}`;
  const client = addClient(name, phone);

  return NextResponse.json(
    {
      success: true,
      client: clientToWire(client),
    },
    { status: 201 }
  );
}
