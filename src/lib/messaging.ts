import twilio from "twilio";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { getWhatsAppDeliveryTo } from "@/lib/comm-config";

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!sid || !token) throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
  return twilio(sid, token);
}

/** Normalize Twilio WhatsApp address from `whatsapp:+1...`, `+1...`, or digits only. */
function toWhatsAppAddress(addr: string): string {
  const t = addr.trim();
  const inner = t.startsWith("whatsapp:") ? t.slice("whatsapp:".length) : t;
  const digits = inner.replace(/^\+/, "").replace(/\D/g, "");
  return `whatsapp:+${digits}`;
}

/** Human-readable Twilio REST errors (for API responses). */
export function twilioErrorDetail(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const o = err as { message?: string; code?: number | string; status?: number };
    if (o.message) {
      const bits = [o.message];
      if (o.code != null) bits.push(`code ${o.code}`);
      if (o.status != null) bits.push(`HTTP ${o.status}`);
      return bits.join(" · ");
    }
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Send WhatsApp via Twilio. Recipient is `TWILIO_WHATSAPP_TO`; set `TWILIO_WHATSAPP_FROM` for the sender.
 */
export async function sendWhatsApp(body: string): Promise<string> {
  const rawFrom = process.env.TWILIO_WHATSAPP_FROM?.trim();
  if (!rawFrom) {
    throw new Error(
      "TWILIO_WHATSAPP_FROM must be set (e.g. whatsapp:+14155238886 for Twilio sandbox)"
    );
  }
  const from = toWhatsAppAddress(rawFrom);
  const to = getWhatsAppDeliveryTo();
  const client = getTwilioClient();
  const msg = await client.messages.create({
    from,
    to,
    body,
  });
  return msg.sid;
}

function getElevenLabs() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY must be set");
  return new ElevenLabsClient({ apiKey: key });
}

/**
 * Generate a voice audio buffer from text using ElevenLabs TTS.
 * Returns a Buffer containing the MP3 audio.
 */
export async function generateVoice(text: string): Promise<Buffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID must be set");

  const eleven = getElevenLabs();
  const stream = await eleven.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}
