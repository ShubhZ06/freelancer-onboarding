import { NextResponse } from "next/server";
import { isTwilioWhatsAppConfigured } from "@/lib/communications";
import { WHATSAPP_DELIVERY_E164_DISPLAY } from "@/lib/comm-config";
import { sendWhatsApp, twilioErrorDetail } from "@/lib/messaging";

/**
 * POST (no body) — sends one test WhatsApp to the hardcoded delivery number in comm-config.
 */
export async function POST() {
  if (!isTwilioWhatsAppConfigured()) {
    return NextResponse.json({
      success: false,
      error: "Missing Twilio env vars (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM)",
    });
  }

  const from = process.env.TWILIO_WHATSAPP_FROM!.trim();

  try {
    const msgSid = await sendWhatsApp(
      `Test WhatsApp from Creator Command Centre → ${WHATSAPP_DELIVERY_E164_DISPLAY}`
    );
    return NextResponse.json({
      success: true,
      sid: msgSid,
      sentTo: WHATSAPP_DELIVERY_E164_DISPLAY,
      from,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: twilioErrorDetail(err),
        sentTo: WHATSAPP_DELIVERY_E164_DISPLAY,
        from,
      },
      { status: 502 }
    );
  }
}
