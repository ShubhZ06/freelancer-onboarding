import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY?.trim();
}

/** Major units (e.g. USD) → Stripe smallest unit (cents). */
export function toStripeAmountCents(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("amount must be a positive finite number");
  }
  const cents = Math.round(amount * 100);
  if (cents < 1) throw new Error("amount is too small");
  return cents;
}
