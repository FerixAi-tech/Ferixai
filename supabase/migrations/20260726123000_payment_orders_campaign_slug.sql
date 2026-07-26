-- Persist fulfilled campaign slug so payment=ok can be tied to a real paid order
ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS campaign_slug text;

CREATE INDEX IF NOT EXISTS payment_orders_campaign_slug_idx
  ON public.payment_orders (campaign_slug)
  WHERE campaign_slug IS NOT NULL;

COMMENT ON COLUMN public.payment_orders.campaign_slug IS
  'content_slug of the campaign created after iyzico collection; set only when status=paid';
