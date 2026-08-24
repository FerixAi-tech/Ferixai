-- Replace iyzico checkout fields with Stripe Checkout session tracking
ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

DROP INDEX IF EXISTS payment_orders_token_idx;

ALTER TABLE public.payment_orders
  DROP COLUMN IF EXISTS iyzico_token,
  DROP COLUMN IF EXISTS iyzico_payment_id;

CREATE INDEX IF NOT EXISTS payment_orders_stripe_session_idx
  ON public.payment_orders(stripe_session_id);

COMMENT ON TABLE public.payment_orders IS
  'Stripe Checkout sessions linked to pending campaign creation';

COMMENT ON COLUMN public.payment_orders.stripe_session_id IS
  'Stripe Checkout Session id (cs_...)';

COMMENT ON COLUMN public.payment_orders.stripe_payment_intent_id IS
  'Stripe PaymentIntent id after successful collection';
