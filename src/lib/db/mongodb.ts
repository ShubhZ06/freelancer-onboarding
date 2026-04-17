import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV === "development") {
  console.warn(
    "[mongodb] MONGODB_URI is not set — lead persistence will be skipped.",
  );
}

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> | null {
  if (!uri) return null;
  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 8_000,
      socketTimeoutMS: 10_000,
    });
    clientPromise = client.connect().catch((err: unknown) => {
      clientPromise = null;
      return Promise.reject(err);
    });
  }
  return clientPromise;
}

export async function getDb(): Promise<Db | null> {
  const p = getClientPromise();
  if (!p) return null;
  try {
    const c = await p;
    return c.db(process.env.MONGODB_DB_NAME ?? "freelancer_os");
  } catch {
    return null;
  }
}
