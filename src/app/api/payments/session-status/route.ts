import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/escrow/stripe-client";

/** Public read for success page — session_id comes from Stripe redirect (opaque). */
export async function GET(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 422 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const amountTotal = session.amount_total;
    const currency = session.currency ?? "usd";
    const paid = session.payment_status === "paid";

    return NextResponse.json({
      paid,
      payment_status: session.payment_status,
      amount_total: amountTotal,
      currency,
      project_title: session.metadata?.projectTitle ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
