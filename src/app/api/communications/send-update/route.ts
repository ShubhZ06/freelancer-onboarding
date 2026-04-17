import { NextRequest, NextResponse } from "next/server";
import { buildUpdateWhatsAppBody, dispatchWhatsAppMessage } from "@/lib/communications";
import { getClient, updateClient } from "@/lib/demo-db";
import { readJsonBody } from "@/lib/http/read-json-body";

export type SendUpdateBody = {
  clientId: string;
  updateSummary: string;
  checklist: string[];
};

export type SendUpdateResponse =
  | { success: true; message: string; preview: string; twilioSid?: string; demo?: boolean }
  | { success: false; error: string };

export async function POST(req: NextRequest): Promise<NextResponse<SendUpdateResponse>> {
  const parsed = await readJsonBody<SendUpdateBody>(req);
  if (!parsed.ok) return parsed.response as NextResponse<SendUpdateResponse>;

  const { clientId, updateSummary, checklist } = parsed.data;

  if (!clientId || !updateSummary || !Array.isArray(checklist) || checklist.length === 0) {
    return NextResponse.json(
      { success: false, error: "clientId, updateSummary, and at least one checklist item are required" },
      { status: 422 }
    );
  }

  const client = getClient(clientId);
  if (!client) {
    return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
  }

  const preview = buildUpdateWhatsAppBody(client, updateSummary, checklist);

  const sent = await dispatchWhatsAppMessage(preview);
  if (!sent.ok) {
    console.error("[Twilio WhatsApp] send-update failed:", sent.detail);
    return NextResponse.json(
      { success: false, error: `WhatsApp failed: ${sent.detail}` },
      { status: 502 }
    );
  }

  updateClient(clientId, {
    status: "Pending Review",
    last_update_sent_at: new Date(),
    pending_checklist: checklist,
    pending_summary: updateSummary,
  });

  return NextResponse.json({
    success: true,
    message: "Update sent successfully",
    preview,
    twilioSid: sent.twilioSid,
    demo: sent.demo,
  });
}
