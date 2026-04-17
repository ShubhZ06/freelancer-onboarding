import type { ObjectId } from "mongodb";

/**
 * Mirrors the EscrowTransaction Mongoose-style contract from payment.md
 * (this app uses the native MongoDB driver).
 */
export const ESCROW_STATUSES = [
  "AWAITING_PAYMENT",
  "FUNDS_HELD",
  "COMPLETED",
  "REFUNDED",
] as const;

export type EscrowStatus = (typeof ESCROW_STATUSES)[number];

export type EscrowTransaction = {
  _id: ObjectId;
  buyerId: string;
  sellerId: string;
  /** Stripe Connect account id (acct_…). */
  sellerStripeAccountId: string;
  /** Amount in major currency units (e.g. USD dollars). */
  amount: number;
  currency: string;
  status: EscrowStatus;
  stripePaymentIntentId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EscrowTransactionInsert = Omit<EscrowTransaction, "_id">;
