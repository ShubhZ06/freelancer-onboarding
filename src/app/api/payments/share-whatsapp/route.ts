import { NextRequest, NextResponse } from "next/server";
import { readJsonBody } from "@/lib/http/read-json-body";
import { dispatchWhatsAppMessage } from "@/lib/communications";

/**
 * Sends the payment link to the configured Twilio WhatsApp recipient (creator testing / single inbox).
 */
export async function POST(req: NextRequest) {
  const parsed = await readJsonBody<{
    checkoutUrl?: string;
    amountUsd?: number;
    projectTitle?: string;
  }>(req);
  if (!parsed.ok) return parsed.response;

  const url = parsed.data.checkoutUrl?.trim();
  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "checkoutUrl must be a valid https URL" }, { status: 422 });
  }

  const amount = parsed.data.amountUsd;
  const title = (parsed.data.projectTitle?.trim() || "Project payment").slice(0, 200);

  const body = [
    "💳 Payment request",
    "",
    `Project: ${title}`,
    typeof amount === "number" && Number.isFinite(amount) ? `Amount: $${amount.toFixed(2)} USD` : "",
    "",
    `Pay securely (Stripe):`,
    url,
    "",
    "Thank you!",
  ]
    .filter(Boolean)
    .join("\n");

  const sent = await dispatchWhatsAppMessage(body);

  if (!sent.ok) {
    return NextResponse.json(
      { success: false, error: sent.detail ?? "WhatsApp send failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    demo: sent.demo,
    twilioSid: sent.twilioSid,
  });
}
