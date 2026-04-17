update the env for strive keys and implement these changes # Role & Context
You are an expert full-stack developer. We are building a hackathon prototype for an "Escrow" marketplace system using a React/Next.js frontend, a Node.js backend (Express or Next.js API routes), and MongoDB. 

We are using Stripe Test Mode to simulate the escrow flow. 

# Security & API Key Context
**CRITICAL:** I am using a Stripe **Restricted API Key** (`rk_test_...`) stored in my `.env` as `STRIPE_SECRET_KEY`. 
This key ONLY has the following 'Write' permissions:
1. `PaymentIntents` (To hold and capture funds)
2. `Charges and Refunds` (To cancel an escrow and refund the buyer)
3. `Transfers` (To route the captured funds to the seller)

Do not use any Stripe methods outside of these permissions (e.g., do not attempt to create Customers, Subscriptions, or use Checkout Sessions).

# Database Architecture Requirement
Create or update an `EscrowTransaction` Mongoose schema with:
- `buyerId` (String/ObjectId)
- `sellerId` (String/ObjectId)
- `sellerStripeAccountId` (String - the connected account ID of the seller)
- `amount` (Number)
- `status` (Enum: ['AWAITING_PAYMENT', 'FUNDS_HELD', 'COMPLETED', 'REFUNDED'])
- `stripePaymentIntentId` (String)

# Backend Implementation Tasks

Please write the complete backend code for the following three API endpoints using the `stripe` Node.js SDK. Include try/catch error handling and MongoDB status updates for each.

## 1. POST `/api/escrow/hold` (The Deposit)
- **Goal:** Authorize the buyer's card and lock the funds without capturing them.
- **Action:** Use `stripe.paymentIntents.create()`. 
- **Required Params:** Pass the `amount` (converted to cents) and set `capture_method: 'manual'`. 
- **DB Update:** Save the `paymentIntent.id` to the database and set status to `FUNDS_HELD`.
- **Response:** Return the `client_secret` to the frontend.

## 2. POST `/api/escrow/release` (The Payout)
- **Goal:** The buyer approved the delivery. Capture the held funds and transfer them to the seller.
- **Action 1:** Fetch the `stripePaymentIntentId` and `sellerStripeAccountId` from MongoDB.
- **Action 2:** Capture the funds using `stripe.paymentIntents.capture(intentId)`.
- **Action 3:** Transfer the funds to the seller using `stripe.transfers.create()`. Pass the `amount`, `currency`, and `destination` (the seller's Stripe account ID). *Note: You can deduct a platform fee here if instructed.*
- **DB Update:** Set status to `COMPLETED`.

## 3. POST `/api/escrow/cancel` (The Dispute/Refund)
- **Goal:** The transaction was cancelled or disputed before completion. Return funds to the buyer.
- **Action:** Use `stripe.paymentIntents.cancel(intentId)` to drop the hold on the funds. (If the funds were already captured by mistake, use `stripe.refunds.create({ payment_intent: intentId })`).
- **DB Update:** Set status to `REFUNDED`.

Please generate the Mongoose schema and the exact backend controller code for these three routes.