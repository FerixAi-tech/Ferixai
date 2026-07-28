-- Browser / network attribution for Meta CAPI (captured at checkout init).
-- iyzico callbacks come from iyzico servers, so IP/UA/cookies must be stored earlier.
ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS client_ip text,
  ADD COLUMN IF NOT EXISTS client_user_agent text,
  ADD COLUMN IF NOT EXISTS meta_fbp text,
  ADD COLUMN IF NOT EXISTS meta_fbc text;

COMMENT ON COLUMN public.payment_orders.client_ip IS
  'Payer IP at checkout initialize (for Meta CAPI client_ip_address).';
COMMENT ON COLUMN public.payment_orders.client_user_agent IS
  'Payer User-Agent at checkout initialize (for Meta CAPI).';
COMMENT ON COLUMN public.payment_orders.meta_fbp IS
  'Meta _fbp cookie at checkout initialize.';
COMMENT ON COLUMN public.payment_orders.meta_fbc IS
  'Meta _fbc cookie at checkout initialize.';
