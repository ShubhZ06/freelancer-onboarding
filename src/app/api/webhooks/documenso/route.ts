/**
 * POST /api/webhooks/documenso
 *
 * Webhook receiver for Documenso document lifecycle events.
 *
 * Security:
 *   - Verifies the `X-Documenso-Secret` header against DOCUMENSO_WEBHOOK_SECRET
 *     using constant-time comparison (crypto.timingSafeEqual).
 *
 * Handled events:
 *   - document.completed — updates the matching contract in MongoDB to
 *     status "Signed" with a completedAt timestamp.
 *
 * All contract data lives in the single "contracts" collection — no separate
 * collections are created.
 */

import crypto from "node:crypto";
import { type NextRequest } from "next/server";
import { getDb } from "@/lib/db/mongodb";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const WEBHOOK_SECRET = process.env.DOCUMENSO_WEBHOOK_SECRET;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Constant-time comparison to prevent timing attacks.
 * Returns `true` if both strings are non-empty and equal.
 */
function timingSafeEqual(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;

  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    // timingSafeEqual throws if lengths differ — pad to same length first
    if (bufA.length !== bufB.length) return false;

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // ── 1. Verify webhook secret ────────────────────────────────────────────
  // If DOCUMENSO_WEBHOOK_SECRET is set we enforce it; if it is intentionally
  // left blank (e.g. during local development) we skip the check with a warning.
  if (WEBHOOK_SECRET) {
    const receivedSecret = request.headers.get("x-documenso-secret") ?? "";

    if (!timingSafeEqual(receivedSecret, WEBHOOK_SECRET)) {
      console.error("[Documenso Webhook] Signature verification failed.", {
        timestamp: new Date().toISOString(),
      });
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[Documenso Webhook] DOCUMENSO_WEBHOOK_SECRET is not set — skipping signature check."
    );
  }


  // ── 2. Parse body ───────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { event, payload, createdAt: webhookCreatedAt } = body;

  if (!event || !payload) {
    return Response.json(
      { error: "Missing event or payload in webhook body." },
      { status: 400 }
    );
  }

  console.log(`[Documenso Webhook] Received event: ${event}`, {
    documentId: payload.id,
    status: payload.status,
  });

  // ── 3. Handle document.completed ─────────────────────────────────────────
  // Documenso sends the event name in lowercase dot-notation: "document.completed"
  if (event === "document.completed") {
    const documentId = payload.id; // Documenso document / envelope ID

    if (documentId === undefined || documentId === null) {
      console.error(
        "[Documenso Webhook] document.completed received but payload.id is missing."
      );
      return Response.json(
        { error: "Missing documentId in payload." },
        { status: 400 }
      );
    }

    // ── 3a. Connect to MongoDB ──────────────────────────────────────────
    const db = await getDb();

    if (!db) {
      console.error(
        "[Documenso Webhook] MongoDB is not available — cannot update contract."
      );
      return Response.json(
        { error: "Database unavailable." },
        { status: 503 }
      );
    }

    // ── 3b. Build the update ────────────────────────────────────────────
    //   We store the Documenso document ID as `documentId` in our unified
    //   "contracts" collection. The update sets:
    //     • status           → "Signed"
    //     • completedAt      → timestamp from Documenso (or now)
    //     • documensoStatus  → raw Documenso status for auditability
    //     • lastWebhookEvent → the raw event name
    //     • updatedAt        → current server time
    //
    //   We also push a lightweight audit entry onto a `webhookHistory`
    //   array so we can replay or debug later without a separate collection.

    const now = new Date();
    const completedAt = payload.completedAt
      ? new Date(payload.completedAt)
      : now;

    // Extract signer details from the payload for denormalization
    const signers = (payload.recipients || [] as Array<Record<string, unknown>>)
      .filter((r: Record<string, unknown>) => r.role === "SIGNER")
      .map((r: Record<string, unknown>) => ({
        recipientId: r.id,
        email: r.email,
        name: r.name,
        signedAt: r.signedAt ? new Date(r.signedAt as string) : null,
        signingStatus: r.signingStatus,
      }));

    const updateDoc = {
      $set: {
        status: "Signed",
        completedAt,
        documensoStatus: payload.status, // "COMPLETED"
        lastWebhookEvent: event,
        updatedAt: now,
        ...(signers.length > 0 && { signers }),
      },
      $push: {
        webhookHistory: {
          event,
          receivedAt: now,
          documensoCreatedAt: webhookCreatedAt
            ? new Date(webhookCreatedAt)
            : null,
          documensoStatus: payload.status,
        },
      },
    };

    // ── 3c. Perform the update ──────────────────────────────────────────
    //   We match on `documentId` which is the Documenso envelope/document ID
    //   stored when the contract was first created via POST /api/contracts/create.
    //   We support both string and numeric IDs since Documenso may return either.

    const contracts = db.collection("contracts");

    const result = await contracts.updateOne(
      {
        $or: [
          { documentId: String(documentId) },
          { documentId: documentId },
        ],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateDoc as any
    );

    if (result.matchedCount === 0) {
      console.warn(
        `[Documenso Webhook] No contract found for documentId=${documentId}. ` +
          "The document may not have been created through our system."
      );

      // Still return 200 so Documenso doesn't retry — this is not an error
      // on their side, just a document we don't track.
      return Response.json({
        received: true,
        matched: false,
        message: `No contract found for documentId ${documentId}.`,
      });
    }

    console.log(
      `[Documenso Webhook] Contract documentId=${documentId} updated to "Signed".`,
      {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      }
    );

    return Response.json({
      received: true,
      matched: true,
      documentId,
      status: "Signed",
      completedAt: completedAt.toISOString(),
    });
  }

  // ── 4. Acknowledge unhandled events ─────────────────────────────────────
  //   Return 200 for events we don't process so Documenso doesn't retry.
  console.log(`[Documenso Webhook] Ignoring unhandled event: ${event}`);

  return Response.json({
    received: true,
    event,
    handled: false,
  });
}
