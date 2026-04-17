import { getDb } from "@/lib/db/mongodb";
import type { Lead } from "./types";

const COLLECTION = "leads";

let indexPromise: Promise<void> | null = null;

function ensureIndexes(): Promise<void> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const db = await getDb();
      if (!db) return;
      const col = db.collection(COLLECTION);
      await Promise.all([
        col.createIndex({ leadId: 1 }, { unique: true }),
        col.createIndex({ url: 1 }),
        col.createIndex({ lastSyncedAt: -1 }),
      ]);
    })().catch((err: unknown) => {
      indexPromise = null;
      throw err;
    });
  }
  return indexPromise;
}

export async function persistLeads(leads: Lead[]): Promise<boolean> {
  if (leads.length === 0) return false;
  const db = await getDb();
  if (!db) return false;

  await ensureIndexes();

  const now = new Date();
  const col = db.collection(COLLECTION);

  const ops = leads.map((lead) => ({
    updateOne: {
      filter: { leadId: lead.id },
      update: {
        $set: {
          leadId: lead.id,
          title: lead.title,
          companyName: lead.companyName,
          location: lead.location ?? null,
          description: lead.description,
          url: lead.url,
          postedAt: lead.postedAt ?? null,
          source: lead.source,
          intentTags: lead.intentTags,
          rawJobType: lead.rawJobType ?? null,
          lastSyncedAt: now,
        },
        $setOnInsert: { firstSeenAt: now },
      },
      upsert: true,
    },
  }));

  const result = await col.bulkWrite(ops, { ordered: false });
  return (result.upsertedCount + result.modifiedCount) >= 0;
}
