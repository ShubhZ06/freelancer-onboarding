/**
 * WhatsApp delivery number comes from `TWILIO_WHATSAPP_TO` (E.164, `+15551234567`, or `whatsapp:+1555...`).
 * Do not hardcode numbers in source — set the env var in `.env.local`.
 */

/** Twilio `to` address: always `whatsapp:+E.164`. */
export function normalizeWhatsAppToAddress(raw: string): string {
  const t = raw.trim();
  const inner = t.startsWith("whatsapp:") ? t.slice("whatsapp:".length) : t;
  const digits = inner.replace(/^\+/, "").replace(/\D/g, "");
  if (digits.length < 10) {
    throw new Error("TWILIO_WHATSAPP_TO must include a valid mobile number (with country code)");
  }
  return `whatsapp:+${digits}`;
}

/** Display form: `+E.164` (no `whatsapp:` prefix). */
export function e164DisplayFromRaw(raw: string): string {
  const t = raw.trim();
  const inner = t.startsWith("whatsapp:") ? t.slice("whatsapp:".length) : t;
  const digits = inner.replace(/^\+/, "").replace(/\D/g, "");
  if (digits.length < 10) {
    throw new Error("Invalid phone in TWILIO_WHATSAPP_TO");
  }
  return `+${digits}`;
}

export function getWhatsAppDeliveryTo(): string {
  const raw = process.env.TWILIO_WHATSAPP_TO?.trim();
  if (!raw) {
    throw new Error("TWILIO_WHATSAPP_TO must be set (E.164 or whatsapp:+E.164)");
  }
  return normalizeWhatsAppToAddress(raw);
}

/** For UI when env is unset or invalid, shows an em dash. */
export function getWhatsAppDeliveryE164Display(): string {
  const raw = process.env.TWILIO_WHATSAPP_TO?.trim();
  if (!raw) return "—";
  try {
    return e164DisplayFromRaw(raw);
  } catch {
    return "—";
  }
}
