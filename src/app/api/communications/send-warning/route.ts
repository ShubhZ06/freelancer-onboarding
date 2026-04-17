import { NextRequest, NextResponse } from "next/server";
import { buildWarningWhatsAppBody, dispatchWhatsAppMessage } from "@/lib/communications";
import { getClient, updateClient } from "@/lib/demo-db";
import { readJsonBody } from "@/lib/http/read-json-body";

export type SendWarningBody = {
  clientId: string;
};

export type SendWarningResponse =
  | {
      success: true;
      message: string;
      preview: string;
      warningLevel: number;
      twilioSid?: string;
      demo?: boolean;
    }
  | { success: false; error: string };

export async function POST(req: NextRequest): Promise<NextResponse<SendWarningResponse>> {
  const parsed = await readJsonBody<SendWarningBody>(req);
  if (!parsed.ok) return parsed.response as NextResponse<SendWarningResponse>;

  const { clientId } = parsed.data;

  if (!clientId) {
    return NextResponse.json({ success: false, error: "clientId is required" }, { status: 422 });
  }

  const client = getClient(clientId);
  if (!client) {
    return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
  }

  if (client.pending_checklist.length === 0) {
    return NextResponse.json(
      { success: false, error: "No pending update found for this client. Send an update first." },
      { status: 409 }
    );
  }

  const preview = buildWarningWhatsAppBody(client);

  const sent = await dispatchWhatsAppMessage(preview);
  if (!sent.ok) {
    console.error("[Twilio WhatsApp] send-warning failed:", sent.detail);
    return NextResponse.json(
      { success: false, error: `WhatsApp failed: ${sent.detail}` },
      { status: 502 }
    );
  }

  const nextLevel = client.warning_level + 1;
  const updated = updateClient(clientId, {
    status: "Paused",
    warning_level: nextLevel,
  });

  return NextResponse.json({
    success: true,
    message: "Warning sent successfully",
    preview,
    warningLevel: updated.warning_level,
    twilioSid: sent.twilioSid,
    demo: sent.demo,
  });
}
