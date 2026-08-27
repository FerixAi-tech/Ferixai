-- Invoice / billing details collected at checkout (Step 3)
CREATE TABLE IF NOT EXISTS public.invoice_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_order_id uuid REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  business_name text NOT NULL,
  email text NOT NULL,
  emirate_city text NOT NULL,
  street_area text NOT NULL,
  trn_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoice_details_user_id_idx
  ON public.invoice_details(user_id);

CREATE INDEX IF NOT EXISTS invoice_details_payment_order_id_idx
  ON public.invoice_details(payment_order_id);

ALTER TABLE public.invoice_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invoice details"
  ON public.invoice_details
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoice details"
  ON public.invoice_details
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.invoice_details IS
  'Billing / invoice details captured before Stripe checkout in the campaign wizard';
