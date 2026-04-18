/**
 * POST /api/contracts/create
 *
 * Creates a Documenso document (envelope) from a Base64-encoded PDF,
 * adds the client as a signer, returns an embedded signing URL, and
 * persists the contract record to MongoDB so the Documenso webhook can
 * later update its status to "Signed".
 *
 * Request body (JSON):
 *   - userId       (string)            — internal user / freelancer ID
 *   - clientEmail  (string)            — signer’s email address
 *   - clientName   (string)            — signer’s display name
 *   - pdfBase64    (string)            — the contract PDF encoded as Base64
 *   - title        (string, optional)  — human-readable contract title
 *
 * Response (JSON):
 *   - signingUrl   (string)  — URL the client can use to sign
 *   - documentId   (string)  — Documenso envelope ID
 *   - contractId   (string)  — our internal MongoDB _id (hex string)
 */

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

import { getDb } from "@/lib/db/mongodb";

import { type NextRequest } from "next/server";

const DOCUMENSO_API_KEY = process.env.DOCUMENSO_API_KEY;
const DOCUMENSO_BASE_URL = (process.env.DOCUMENSO_BASE_URL || "https://app.documenso.com").replace(/\/+$/, "");

/**
 * Small helper that calls a Documenso v2 endpoint and returns the parsed JSON.
 * Throws a descriptive error on non-2xx responses.
 */
async function documensoFetch(path: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
  const url = `${DOCUMENSO_BASE_URL}/api/v2${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${DOCUMENSO_API_KEY}`,
      ...options.headers,
    },
  });

  // Attempt to parse the body regardless of status so we can surface the
  // Documenso error message when something goes wrong.
  let body;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  if (!res.ok) {
    const msg =
      typeof body === "object" && body?.message
        ? body.message
        : typeof body === "string"
          ? body
          : JSON.stringify(body);

    const hint =
      res.status === 404 && path.startsWith("/envelope")
        ? " Hint: DOCUMENSO_BASE_URL should be the Documenso host origin (e.g. https://app.documenso.com), without /api/v1 or /api/v2."
        : "";

    throw new Error(
      `Documenso API error [${res.status}] at ${path}: ${msg}${hint}`
    );
  }

  return body;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Validate environment --------------------------------------------------
  if (!DOCUMENSO_API_KEY) {
    return Response.json(
      { error: "Server misconfiguration: DOCUMENSO_API_KEY is not set." },
      { status: 500 }
    );
  }

  // 2. Parse & validate the incoming request body ----------------------------
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { userId, clientEmail, clientName, pdfBase64, title } = body;

  if (!userId || typeof userId !== "string") {
    return Response.json(
      { error: "Missing or invalid field: userId (string)." },
      { status: 400 }
    );
  }
  if (!clientEmail || typeof clientEmail !== "string") {
    return Response.json(
      { error: "Missing or invalid field: clientEmail (string)." },
      { status: 400 }
    );
  }
  if (!clientName || typeof clientName !== "string") {
    return Response.json(
      { error: "Missing or invalid field: clientName (string)." },
      { status: 400 }
    );
  }
  if (!pdfBase64 || typeof pdfBase64 !== "string") {
    return Response.json(
      { error: "Missing or invalid field: pdfBase64 (string)." },
      { status: 400 }
    );
  }

  try {
    // 3. Decode the Base64 PDF into a binary buffer ---------------------------
    //    Strip an optional data-URI prefix (e.g. "data:application/pdf;base64,")
    const raw = pdfBase64.includes(",")
      ? pdfBase64.split(",")[1]
      : pdfBase64;

    const pdfBuffer = Buffer.from(raw, "base64");

    if (pdfBuffer.length === 0) {
      return Response.json(
        { error: "pdfBase64 decoded to an empty buffer — check the encoding." },
        { status: 400 }
      );
    }

    // 4. Build multipart/form-data for envelope creation ----------------------
    //    Documenso v2 POST /envelope/create expects multipart/form-data with:
    //      - "payload" (JSON stringified object)
    //      - "files"   (one or more PDF file parts)

    const payload = {
      title: `Contract for ${clientName}`,
      type: "DOCUMENT",
      recipients: [
        {
          email: clientEmail,
          name: clientName,
          role: "SIGNER",
          fields: [
            {
              identifier: 0,
              type: "SIGNATURE",
              page: 1,
              positionX: 15,
              positionY: 80,
              width: 32,
              height: 8,
              fieldMeta: { type: "signature" },
            },
            {
              identifier: 0,
              type: "DATE",
              page: 1,
              positionX: 52,
              positionY: 80,
              width: 20,
              height: 4,
            },
          ],
        },
      ],
      meta: {
        distributionMethod: "EMAIL",
      },
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));

    // Attach the PDF as a File object
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    formData.append("files", pdfBlob, `contract-${userId}.pdf`);

    // 5. Create the envelope in Documenso ------------------------------------
    const createResult = await documensoFetch("/envelope/create", {
      method: "POST",
      body: formData,
      // Let the runtime set the correct Content-Type (multipart boundary).
      // Do NOT manually set Content-Type here.
    });

    const envelopeId = createResult.id;

    if (!envelopeId) {
      throw new Error(
        "Documenso did not return an envelope ID after creation."
      );
    }

    // 6. Distribute the envelope so it transitions out of Draft and recipient
    // signing links become valid.
    let distributedRecipient = null;

    try {
      const distributeGeneric = await documensoFetch(`/envelope/distribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envelopeId }),
      });

      const genericRecipients = (distributeGeneric?.recipients ?? []) as Array<Record<string, unknown>>;
      distributedRecipient = genericRecipients.find(
        (r) => String(r.email || "").toLowerCase() === clientEmail.toLowerCase()
      ) ?? null;
    } catch (firstErr) {
      const firstMessage = firstErr instanceof Error ? firstErr.message : String(firstErr);

      try {
        const distributeById = await documensoFetch(`/envelope/${envelopeId}/distribute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const byIdRecipients = (distributeById?.recipients ?? []) as Array<Record<string, unknown>>;
        distributedRecipient = byIdRecipients.find(
          (r) => String(r.email || "").toLowerCase() === clientEmail.toLowerCase()
        ) ?? null;
      } catch (secondErr) {
        const secondMessage = secondErr instanceof Error ? secondErr.message : String(secondErr);
        throw new Error(
          `Failed to distribute envelope via Documenso. First attempt error: ${firstMessage}. Second attempt error: ${secondMessage}`
        );
      }
    }

    // 7. Retrieve the finalized envelope to get the recipient signing details
    const envelope = await documensoFetch(`/envelope/${envelopeId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const recipients = (envelope.recipients ?? []) as Array<Record<string, unknown>>;
    const signer = recipients.find(
      (r) =>
        r.role === "SIGNER" &&
        String(r.email || "").toLowerCase() === clientEmail.toLowerCase()
    );

    const signerToken = (
      (signer?.token as string | undefined) ||
      (signer?.signingToken as string | undefined) ||
      (signer?.directLinkToken as string | undefined) ||
      ((envelope.directLink as Record<string, unknown> | undefined)?.token as string | undefined) ||
      ((createResult.directLink as Record<string, unknown> | undefined)?.token as string | undefined) ||
      null
    );

    const signingUrlCandidates = [
      (distributedRecipient as Record<string, unknown> | null)?.signingUrl as string | undefined,
      (distributedRecipient as Record<string, unknown> | null)?.url as string | undefined,
      signer?.signingUrl as string | undefined,
      signer?.signingLink as string | undefined,
      signer?.url as string | undefined,
      envelope?.signingUrl as string | undefined,
      envelope?.url as string | undefined,
      createResult?.signingUrl as string | undefined,
      createResult?.url as string | undefined,
      signerToken ? `${DOCUMENSO_BASE_URL}/sign/${signerToken}` : null,
    ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

    const signingUrl = signingUrlCandidates[0] || null;

    if (!signingUrl) {
      throw new Error(
        "Could not locate a valid signing URL for the recipient on the finalized envelope."
      );
    }

    // 8. Persist the contract record to MongoDB ------------------------------
    //   This record is what the Documenso webhook (POST /api/webhooks/documenso)
    //   matches against when the document is completed. Without this step,
    //   updateOne({ documentId }) will always return matchedCount: 0.
    const now = new Date();
    let contractId = null;

    try {
      const db = await getDb();
      if (db) {
        const result = await db.collection("contracts").insertOne({
          documentId: String(envelopeId),  // stored as string for consistent matching
          userId,
          clientName,
          clientEmail,
          title: title ?? `Contract for ${clientName}`,
          signingUrl,
          status: "Sent",
          createdAt: now,
          updatedAt: now,
        });
        contractId = result.insertedId?.toString() ?? null;
      } else {
        // DB not available (e.g. MONGODB_URI not set in dev) — log and continue.
        console.warn(
          "[POST /api/contracts/create] MongoDB unavailable — contract not persisted."
        );
      }
    } catch (dbErr) {
      // Non-fatal: log the DB error but still return the signing URL to the
      // frontend. The contract simply won't appear in the signing dashboard.
      console.error(
        "[POST /api/contracts/create] Failed to persist contract to MongoDB:",
        dbErr
      );
    }

    // 9. Return the result to the frontend ------------------------------------
    return Response.json(
      {
        signingUrl,
        documentId: String(envelopeId),
        contractId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/contracts/create] Unhandled error:", err);

    // Surface a safe error message — avoid leaking internal stack traces.
    return Response.json(
      {
        error: "Failed to create the contract document.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
