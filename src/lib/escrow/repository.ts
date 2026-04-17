import { ObjectId, type Collection } from "mongodb";
import { getDb } from "@/lib/db/mongodb";
import type { EscrowStatus, EscrowTransaction, EscrowTransactionInsert } from "./types";

const COLLECTION = "escrow_transactions";

type EscrowCol = Collection<EscrowTransaction>;

let indexPromise: Promise<void> | null = null;

function ensureIndexes(): Promise<void> {
  if (!indexPromise) {
    indexPromise = (async () => {
      const db = await getDb();
      if (!db) return;
      const col = db.collection<EscrowTransaction>(COLLECTION);
      await Promise.all([
        col.createIndex({ stripePaymentIntentId: 1 }, { unique: true }),
        col.createIndex({ buyerId: 1, createdAt: -1 }),
        col.createIndex({ sellerId: 1, createdAt: -1 }),
      ]);
    })().catch((err: unknown) => {
      indexPromise = null;
      throw err;
    });
  }
  return indexPromise;
}

async function collection(): Promise<EscrowCol | null> {
  const db = await getDb();
  if (!db) return null;
  await ensureIndexes();
  return db.collection<EscrowTransaction>(COLLECTION);
}

export function toObjectId(id: string): ObjectId | null {
  try {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function insertEscrowTransaction(
  doc: EscrowTransactionInsert
): Promise<{ insertedId: ObjectId } | null> {
  const col = await collection();
  if (!col) return null;
  const result = await col.insertOne(doc as never);
  return { insertedId: result.insertedId };
}

export async function findEscrowById(id: ObjectId): Promise<EscrowTransaction | null> {
  const col = await collection();
  if (!col) return null;
  return col.findOne({ _id: id });
}

export async function updateEscrowStatus(
  id: ObjectId,
  status: EscrowStatus
): Promise<{ modified: boolean } | null> {
  const col = await collection();
  if (!col) return null;
  const r = await col.updateOne(
    { _id: id },
    { $set: { status, updatedAt: new Date() } }
  );
  return { modified: r.modifiedCount > 0 };
}
