import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/escrow/stripe-client";
import { markCheckoutPaid } from "@/lib/payments/checkout-records";

export const runtime = "nodejs";

/**
 * Stripe webhooks — configure endpoint in Dashboard with signing secret STRIPE_WEBHOOK_SECRET.
 * Handles checkout.session.completed to mark DB records paid.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set" }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id) {
      await markCheckoutPaid(session.id, new Date());
    }
  }

  return NextResponse.json({ received: true });
}
