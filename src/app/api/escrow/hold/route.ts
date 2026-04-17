import { NextRequest, NextResponse } from "next/server";
import { readJsonBody } from "@/lib/http/read-json-body";
import { insertEscrowTransaction } from "@/lib/escrow/repository";
import { getStripe, isStripeConfigured, toStripeAmountCents } from "@/lib/escrow/stripe-client";

/**
 * POST /api/escrow/hold — create a manual-capture PaymentIntent (escrow deposit) and persist FUNDS_HELD.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY is not configured" }, { status: 503 });
  }

  const parsed = await readJsonBody<{
    buyerId?: string;
    sellerId?: string;
    sellerStripeAccountId?: string;
    amount?: number;
    currency?: string;
  }>(req);
  if (!parsed.ok) return parsed.response;

  const { buyerId, sellerId, sellerStripeAccountId, amount, currency = "usd" } = parsed.data;

  if (!buyerId?.trim() || !sellerId?.trim() || !sellerStripeAccountId?.trim()) {
    return NextResponse.json(
      { error: "buyerId, sellerId, and sellerStripeAccountId are required" },
      { status: 422 }
    );
  }

  if (amount == null || typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 422 });
  }

  const currencyNorm = String(currency).trim().toLowerCase() || "usd";

  let cents: number;
  try {
    cents = toStripeAmountCents(amount);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid amount" },
      { status: 422 }
    );
  }

  try {
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.create({
      amount: cents,
      currency: currencyNorm,
      capture_method: "manual",
      metadata: {
        buyerId: buyerId.trim(),
        sellerId: sellerId.trim(),
        sellerStripeAccountId: sellerStripeAccountId.trim(),
      },
    });

    const now = new Date();
    const inserted = await insertEscrowTransaction({
      buyerId: buyerId.trim(),
      sellerId: sellerId.trim(),
      sellerStripeAccountId: sellerStripeAccountId.trim(),
      amount,
      currency: currencyNorm,
      status: "FUNDS_HELD",
      stripePaymentIntentId: pi.id,
      createdAt: now,
      updatedAt: now,
    });

    if (!inserted) {
      await stripe.paymentIntents.cancel(pi.id).catch(() => {});
      return NextResponse.json(
        { error: "Database unavailable; the PaymentIntent was cancelled." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      client_secret: pi.client_secret,
      transactionId: inserted.insertedId.toHexString(),
      paymentIntentId: pi.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
