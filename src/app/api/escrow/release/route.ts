import { NextRequest, NextResponse } from "next/server";
import { readJsonBody } from "@/lib/http/read-json-body";
import {
  findEscrowById,
  toObjectId,
  updateEscrowStatus,
} from "@/lib/escrow/repository";
import { getStripe, isStripeConfigured, toStripeAmountCents } from "@/lib/escrow/stripe-client";

/**
 * POST /api/escrow/release — capture held funds, then transfer to the seller Connect account.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY is not configured" }, { status: 503 });
  }

  const parsed = await readJsonBody<{ transactionId?: string }>(req);
  if (!parsed.ok) return parsed.response;

  const transactionId = parsed.data.transactionId?.trim();
  if (!transactionId) {
    return NextResponse.json({ error: "transactionId is required" }, { status: 422 });
  }

  const oid = toObjectId(transactionId);
  if (!oid) {
    return NextResponse.json({ error: "Invalid transactionId" }, { status: 422 });
  }

  try {
    const doc = await findEscrowById(oid);
    if (!doc) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (doc.status !== "FUNDS_HELD") {
      return NextResponse.json(
        { error: `Release is only valid when status is FUNDS_HELD (got ${doc.status})` },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(doc.stripePaymentIntentId);

    if (pi.status === "requires_capture") {
      await stripe.paymentIntents.capture(doc.stripePaymentIntentId);
    } else if (pi.status === "succeeded") {
      // Funds already captured; continue to transfer (idempotent-ish release).
    } else {
      return NextResponse.json(
        {
          error: `PaymentIntent cannot be released (status: ${pi.status}). Expected requires_capture or succeeded.`,
        },
        { status: 409 }
      );
    }

    const cents = toStripeAmountCents(doc.amount);
    await stripe.transfers.create({
      amount: cents,
      currency: doc.currency,
      destination: doc.sellerStripeAccountId,
    });

    const upd = await updateEscrowStatus(oid, "COMPLETED");
    if (!upd) {
      return NextResponse.json({ error: "Database unavailable while updating status" }, { status: 503 });
    }

    return NextResponse.json({ success: true, status: "COMPLETED" as const });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
