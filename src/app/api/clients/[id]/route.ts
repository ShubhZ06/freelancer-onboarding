import { NextRequest, NextResponse } from "next/server";
import { deleteClient } from "@/lib/demo-db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteClient(id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
