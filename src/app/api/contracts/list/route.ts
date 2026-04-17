/**
 * GET /api/contracts/list
 *
 * Returns all contracts stored in the unified "contracts" MongoDB collection,
 * sorted by updatedAt descending (most recently modified first).
 *
 * Response shape (JSON array):
 *   [
 *     {
 *       _id:               string   (MongoDB ObjectId serialised as hex string)
 *       documentId:        string   (Documenso envelope / document ID)
 *       status:            string   ("Sent" | "Signed" | "Draft" | "Ready to Send" | …)
 *       title:             string
 *       clientName:        string
 *       clientEmail:       string
 *       userId:            string
 *       completedAt:       string | null   (ISO-8601 when signed, else null)
 *       updatedAt:         string | null   (ISO-8601)
 *       createdAt:         string | null   (ISO-8601)
 *     },
 *     …
 *   ]
 *
 * Status codes:
 *   200  — success (may be an empty array if no contracts exist)
 *   503  — database unavailable
 *   500  — unexpected server error
 */

import { getDb } from "@/lib/db/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    // Return an empty array gracefully when the DB is not configured
    // (e.g. MONGODB_URI missing in dev) rather than a hard 503.
    if (!db) {
      return Response.json([], { status: 200 });
    }

    const contracts = db.collection("contracts");

    // Project only the fields needed by the signing dashboard.
    // Exclude heavy fields like pdfBase64 and webhookHistory.
    const docs = await contracts
      .find(
        {},
        {
          projection: {
            _id: 1,
            documentId: 1,
            status: 1,
            title: 1,
            clientName: 1,
            clientEmail: 1,
            userId: 1,
            completedAt: 1,
            updatedAt: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ updatedAt: -1 })
      .toArray();

    // Serialise MongoDB ObjectId and Date objects so they JSON-encode cleanly.
    const serialised = docs.map((doc: Record<string, unknown>) => ({
      ...doc,
      _id: doc._id?.toString?.() ?? null,
      completedAt: doc.completedAt instanceof Date
        ? doc.completedAt.toISOString()
        : doc.completedAt ?? null,
      updatedAt: doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : doc.updatedAt ?? null,
      createdAt: doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt ?? null,
    }));

    return Response.json(serialised, { status: 200 });
  } catch (err) {
    console.error("[GET /api/contracts/list] Unhandled error:", err);

    return Response.json(
      {
        error: "Failed to retrieve contracts.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
