-- Pending iyzico checkout sessions before campaign creation
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id text NOT NULL UNIQUE,
  iyzico_token text,
  plan_slug text NOT NULL,
  amount_gbp numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'GBP',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  campaign_payload jsonb NOT NULL,
  iyzico_payment_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_orders_user_id_idx ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS payment_orders_token_idx ON public.payment_orders(iyzico_token);
CREATE INDEX IF NOT EXISTS payment_orders_status_idx ON public.payment_orders(status);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Only service role / admin client used from API routes; no direct client access needed.
CREATE POLICY "Users can read own payment orders"
  ON public.payment_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.payment_orders IS 'iyzico Checkout Form sessions linked to pending campaign creation';
