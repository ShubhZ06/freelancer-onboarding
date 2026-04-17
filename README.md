This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Acquisition / lead finder

The **Acquisition** page (`/acquisition`) merges public listings from:

- **Arbeitnow**, **Remotive**, and **Remote OK** (no API keys)
- **Adzuna**, **Jooble**, and **USAJOBS** when the env vars below are set

Normalized leads are upserted into **MongoDB** when `MONGODB_URI` is configured.

### Environment

Copy `.env.example` to `.env.local` and set:

- `MONGODB_URI` — persist leads (e.g. MongoDB Atlas).
- `MONGODB_DB_NAME` — optional, default `freelancer_os`.

Optional sources:

- `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY` (e.g. `gb`, `us`)
- `JOOBLE_API_KEY` — from [Jooble API](https://jooble.org/api/about)
- `USAJOBS_API_KEY`, `USAJOBS_EMAIL` — from [USAJOBS API](https://developer.usajobs.gov/); optional `USAJOBS_USER_AGENT` (defaults to email)

If live APIs return nothing for your filters, the API **retries without intent chips**, then falls back to **demo data**.

### Source attribution

- [Remotive](https://remotive.com/api-documentation): link to job URLs and credit Remotive.
- [Remote OK](https://remoteok.com/api): link back with a follow link and mention Remote OK per their API terms.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Node driver](https://www.mongodb.com/docs/drivers/node/current/)

## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
