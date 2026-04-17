import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { AiUsageCredentials } from "./types";
import { sanitizeCredentials } from "./credentials";

export const AI_USAGE_COOKIE_NAME = "fos_ai_usage_v1";

const ALGO = "aes-256-gcm";

function keyFromSecret(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function sealCredentials(creds: AiUsageCredentials, secret: string): string {
  const clean = sanitizeCredentials(creds);
  const key = keyFromSecret(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const json = JSON.stringify(clean);
  const enc = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function unsealCredentials(payload: string, secret: string): AiUsageCredentials | null {
  try {
    const buf = Buffer.from(payload, "base64url");
    if (buf.length < 12 + 16) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const key = keyFromSecret(secret);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(json) as AiUsageCredentials;
    return sanitizeCredentials(parsed);
  } catch {
    return null;
  }
}
