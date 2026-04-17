import { NextRequest, NextResponse } from "next/server";
import { readJsonBody } from "@/lib/http/read-json-body";
import {
  findEscrowById,
  toObjectId,
  updateEscrowStatus,
} from "@/lib/escrow/repository";
import { getStripe, isStripeConfigured } from "@/lib/escrow/stripe-client";

/**
 * POST /api/escrow/cancel — cancel an uncaptured authorization or refund a captured one.
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

    if (doc.status === "COMPLETED" || doc.status === "REFUNDED") {
      return NextResponse.json(
        { error: `Transaction already finalized (${doc.status})` },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const intentId = doc.stripePaymentIntentId;
    const pi = await stripe.paymentIntents.retrieve(intentId);

    if (pi.status === "requires_capture") {
      await stripe.paymentIntents.cancel(intentId);
    } else if (pi.status === "requires_payment_method") {
      await stripe.paymentIntents.cancel(intentId).catch(() => {});
    } else if (pi.status === "succeeded") {
      await stripe.refunds.create({ payment_intent: intentId });
    } else if (pi.status === "canceled") {
      // Nothing to do on Stripe side.
    } else {
      try {
        await stripe.paymentIntents.cancel(intentId);
      } catch {
        await stripe.refunds.create({ payment_intent: intentId });
      }
    }

    const upd = await updateEscrowStatus(oid, "REFUNDED");
    if (!upd) {
      return NextResponse.json({ error: "Database unavailable while updating status" }, { status: 503 });
    }

    return NextResponse.json({ success: true, status: "REFUNDED" as const });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
