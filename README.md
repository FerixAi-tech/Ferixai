# FerixAI

FerixAI helps UK local businesses become easier to find when people ask AI assistants for recommendations.

## Stack

- Next.js 16 (App Router)
- React 19
- Supabase Auth + Postgres
- OpenAI content generation
- Optional WordPress / Dev.to publishing

## Getting started

1. Copy `.env.example` to `.env.local` and fill in values.
2. Apply the SQL migration in `supabase/migrations`.
3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Product notes

- Payments use **iyzico Checkout Form** when `FERIXAI_PAYMENT_REQUIRED=true`.
- Set `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, and optionally `IYZICO_BASE_URL` in `.env.local` (never commit secrets).
- Production callback URL must be HTTPS (`/api/payments/iyzico/callback`).
- There is no community forum in this product.
