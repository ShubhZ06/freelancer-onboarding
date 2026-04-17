import { ObjectId, type Collection } from "mongodb";
import { getDb } from "@/lib/db/mongodb";

const COLLECTION = "payment_checkout_sessions";

export type PaymentCheckoutStatus = "pending" | "paid" | "cancelled";

export type PaymentCheckoutRecord = {
  _id: ObjectId;
  stripeCheckoutSessionId: string;
  amountUsd: number;
  currency: string;
  projectTitle: string;
  status: PaymentCheckoutStatus;
  createdAt: Date;
  paidAt?: Date;
};

let indexPromise: Promise<void> | null = null;

function ensureIndexes(): Promise<void> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const db = await getDb();
      if (!db) return;
      const col = db.collection(COLLECTION);
      await col.createIndex({ stripeCheckoutSessionId: 1 }, { unique: true });
    })().catch((err: unknown) => {
      indexPromise = null;
      throw err;
    });
  }
  return indexPromise;
}

export async function insertCheckoutRecord(
  doc: Omit<PaymentCheckoutRecord, "_id">
): Promise<ObjectId | null> {
  const db = await getDb();
  if (!db) return null;
  await ensureIndexes();
  const r = await db.collection(COLLECTION).insertOne(doc as Record<string, unknown>);
  return r.insertedId;
}

export async function markCheckoutPaid(sessionId: string, paidAt: Date): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const col = db.collection<PaymentCheckoutRecord>(COLLECTION);
  const res = await col.updateOne(
    { stripeCheckoutSessionId: sessionId },
    { $set: { status: "paid", paidAt } }
  );
  return res.modifiedCount > 0 || res.matchedCount > 0;
}
