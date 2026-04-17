import { NextRequest, NextResponse } from "next/server";
import { readJsonBody } from "@/lib/http/read-json-body";
import { getStripe, isStripeConfigured, toStripeAmountCents } from "@/lib/escrow/stripe-client";
import { getAppBaseUrl } from "@/lib/payments/app-base-url";
import { insertCheckoutRecord } from "@/lib/payments/checkout-records";

/**
 * Creates a Stripe Checkout Session (hosted pay page) — requires Checkout Sessions permission on your API key.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY is not configured" }, { status: 503 });
  }

  const parsed = await readJsonBody<{
    amountUsd?: number;
    projectTitle?: string;
    clientLabel?: string;
  }>(req);
  if (!parsed.ok) return parsed.response;

  const { amountUsd, projectTitle, clientLabel } = parsed.data;
  if (amountUsd == null || typeof amountUsd !== "number" || !Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json({ error: "amountUsd must be a positive number" }, { status: 422 });
  }

  const title = (projectTitle?.trim() || "Project payment").slice(0, 200);
  let cents: number;
  try {
    cents = toStripeAmountCents(amountUsd);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid amount" },
      { status: 422 }
    );
  }

  const base = getAppBaseUrl();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: cents,
            product_data: {
              name: title,
              description: clientLabel?.trim() ? clientLabel.trim().slice(0, 500) : undefined,
            },
          },
        },
      ],
      success_url: `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/payment/cancel`,
      metadata: {
        projectTitle: title,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
    }

    const now = new Date();
    await insertCheckoutRecord({
      stripeCheckoutSessionId: session.id,
      amountUsd,
      currency: "usd",
      projectTitle: title,
      status: "pending",
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: message,
        hint:
          "Restricted keys need the Checkout Sessions (write) permission — in Dashboard: Developers → API keys → your rk_ key → enable Checkout Sessions, or use permission rak_checkout_session_write. Alternatively use your standard Secret key (sk_test_…) in development.",
      },
      { status: 500 }
    );
  }
}
