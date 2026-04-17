import { getWhatsAppDeliveryE164Display } from "@/lib/comm-config";
import { sendWhatsApp, twilioErrorDetail } from "@/lib/messaging";

export function isTwilioWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_WHATSAPP_FROM?.trim() &&
      process.env.TWILIO_WHATSAPP_TO?.trim()
  );
}

/**
 * Sends WhatsApp when Twilio env is complete; otherwise logs preview (demo) and returns success with demo: true.
 */
export async function dispatchWhatsAppMessage(
  body: string
): Promise<{ ok: true; twilioSid?: string; demo: boolean } | { ok: false; detail: string }> {
  if (isTwilioWhatsAppConfigured()) {
    try {
      const twilioSid = await sendWhatsApp(body);
      return { ok: true, twilioSid, demo: false };
    } catch (err) {
      return { ok: false, detail: twilioErrorDetail(err) };
    }
  }

  console.log("[DEMO] Twilio WhatsApp env not set — skipping real send.");
  console.log("[DEMO] Would WhatsApp", getWhatsAppDeliveryE164Display());
  console.log(body);
  return { ok: true, demo: true };
}
