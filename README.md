# FlowDesk

A full-stack freelancer workspace built with Next.js App Router.

FlowDesk combines the most common freelancer workflows in one product:

- find client opportunities
- generate contracts
- send progress updates and warning reminders
- route contracts for e-signature
- collect payments and run escrow actions
- maintain reusable profile/business details

## What This Project Includes

### Frontend modules

- `/dashboard`: module launcher workspace
- `/acquisition`: client opportunity search with intent filters
- `/contracts`: 3-step contract intake -> style -> preview
- `/communications`: send project updates and warning reminders
- `/payment/generate`: create and share Stripe checkout links
- `/signing`: view and track contract signing records
- `/settings`: editable profile and business details
- `/expenses`: placeholder page for expense insights
- `/sign-in`, `/sign-up`: auth entry points
- `/contract/[id]`: contract viewing/signing route

### Backend domains (Next.js route handlers)

- acquisition: aggregate leads from multiple sources
- clients: lightweight client CRUD for communications
- contracts: create signature requests and list contracts
- communications: WhatsApp update/warning dispatch + voice generation
- payments: Stripe checkout creation/status/share
- escrow: hold/release/cancel funds flow
- webhooks: Stripe and Documenso webhook handling

## Current Architecture (As Implemented)

- framework: Next.js `16.2.4` (App Router)
- ui: React `19`, Tailwind CSS `4`
- database: MongoDB (native driver)
- contracts/signing: Documenso API + webhook callback
- messaging: Twilio WhatsApp
- voice notes: ElevenLabs TTS
- payments/escrow: Stripe

The app is currently a modular monolith in one Next.js codebase.

## Key User Flows

### 1) Sign up and profile reuse

- sign-up captures personal + business details
- profile data is reused in contracts/settings and related flows
- session state is stored locally for this MVP

### 2) Contract generation and sending

1. user fills contract intake in `/contracts`
2. contract text + summary are generated
3. rendered contract is converted to PDF using `html2canvas-pro` + `jsPDF`
4. PDF is posted to `/api/contracts/create-signature`
5. backend creates/distributes document through Documenso
6. signing link is returned and shown in the UI
7. webhook `/api/webhooks/documenso` marks matching record as `Signed`

### 3) Client communication

1. add/select client in `/communications`
2. send update with summary + checklist (`/api/communications/send-update`)
3. send warning reminder (`/api/communications/send-warning`)
4. optional voice note generation (`/api/communications/generate-voice`)

### 4) Payments and escrow

- checkout flow: `/api/payments/create-checkout` creates Stripe Checkout Session
- verification: `/api/payments/session-status` checks payment status
- sharing: `/api/payments/share-whatsapp` sends checkout URL over WhatsApp
- escrow hold/release/cancel via:
	- `/api/escrow/hold`
	- `/api/escrow/release`
	- `/api/escrow/cancel`

## API Reference

### Acquisition

- `GET /api/acquisition/leads`
	- sources always available: Arbeitnow, Remotive, Remote OK
	- optional sources when configured: Adzuna, Jooble, USAJOBS
	- returns normalized merged leads, warnings, source list, and persistence status

### Clients

- `GET /api/clients`
- `POST /api/clients`
- `DELETE /api/clients/[id]`

### Contracts

- `POST /api/contracts/create`
- `POST /api/contracts/create-signature` (proxy to create)
- `GET /api/contracts/list`

### Communications

- `POST /api/communications/send-update`
- `POST /api/communications/send-warning`
- `POST /api/communications/generate-voice`
- `POST /api/debug-whatsapp`

### Payments and escrow

- `POST /api/payments/create-checkout`
- `GET /api/payments/session-status`
- `POST /api/payments/share-whatsapp`
- `POST /api/escrow/hold`
- `POST /api/escrow/release`
- `POST /api/escrow/cancel`

### Webhooks

- `POST /api/webhooks/stripe`
- `POST /api/webhooks/documenso`

## Environment Variables

Create `.env.local` in the project root.

### Required for core features

- `MONGODB_URI`
- `STRIPE_SECRET_KEY`
- `DOCUMENSO_API_KEY`

### Strongly recommended

- `MONGODB_DB_NAME` (default: `freelancer_os`)
- `NEXT_PUBLIC_APP_URL` (default fallback: `http://localhost:3000`)
- `STRIPE_WEBHOOK_SECRET`
- `DOCUMENSO_BASE_URL` (default: `https://app.documenso.com`)
- `DOCUMENSO_WEBHOOK_SECRET`

### Optional lead-source providers

- `ADZUNA_APP_ID`
- `ADZUNA_APP_KEY`
- `ADZUNA_COUNTRY` (default: `gb`)
- `JOOBLE_API_KEY`
- `USAJOBS_API_KEY`
- `USAJOBS_EMAIL`
- `USAJOBS_USER_AGENT`

### Optional communications integrations

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `TWILIO_WHATSAPP_TO`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB (Atlas or local)

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
```

## Data and Runtime Notes

- contract, escrow, payment, and lead persistence use MongoDB when configured
- communications clients are currently stored in an in-memory demo store (`globalThis`) for rapid iteration
- auth/session is currently local-storage + cookie based for MVP behavior
- several integrations degrade gracefully when not configured (for example preview/demo behavior)


## Repository Layout (High Level)

```text
src/
	app/
		api/                # all backend route handlers
		acquisition/
		communications/
		contracts/
		dashboard/
		expenses/
		payment/
		settings/
		sign-in/
		sign-up/
		signing/
	components/
		acquisition/
		auth/
		communications/
		contracts/
		dashboard/
		navigation/
		workspace/
	lib/
		acquisition/
		communications/
		db/
		escrow/
		payments/
		auth-session.ts
		contract-engine.ts
		demo-db.ts
```

## Production Readiness Checklist

- move auth to managed provider and hashed credentials
- migrate demo client store to persistent database records
- configure Stripe and Documenso webhooks in deployment environment
- add environment validation on boot
- add integration tests for contract, payment, and webhook pipelines
