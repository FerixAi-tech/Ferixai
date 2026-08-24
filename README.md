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

- Paid plans use **Stripe Checkout** in production.
- Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel env.
- Stripe webhook endpoint: `https://www.ferixai.com/api/payments/stripe/webhook`
- Set `NEXT_PUBLIC_APP_URL=https://www.ferixai.com` so Stripe success/cancel URLs are correct.
- Local-only bypass: `FERIXAI_PAYMENT_REQUIRED=false` (ignored outside development).
- There is no community forum in this product.
