import { NextResponse } from "next/server";
import { isTwilioWhatsAppConfigured } from "@/lib/communications";
import { getWhatsAppDeliveryE164Display } from "@/lib/comm-config";
import { sendWhatsApp, twilioErrorDetail } from "@/lib/messaging";

/**
 * POST (no body) — sends one test WhatsApp to TWILIO_WHATSAPP_TO.
 */
export async function POST() {
  if (!isTwilioWhatsAppConfigured()) {
    return NextResponse.json({
      success: false,
      error:
        "Missing Twilio env vars (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_WHATSAPP_TO)",
    });
  }

  const from = process.env.TWILIO_WHATSAPP_FROM!.trim();
  const sentTo = getWhatsAppDeliveryE164Display();

  try {
    const msgSid = await sendWhatsApp(
      `Test WhatsApp from Creator Command Centre → ${sentTo}`
    );
    return NextResponse.json({
      success: true,
      sid: msgSid,
      sentTo,
      from,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: twilioErrorDetail(err),
        sentTo,
        from,
      },
      { status: 502 }
    );
  }
}
