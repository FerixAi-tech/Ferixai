-- Allow fulfillment lock between iyzico confirmation and campaign create
ALTER TABLE public.payment_orders
  DROP CONSTRAINT IF EXISTS payment_orders_status_check;

ALTER TABLE public.payment_orders
  ADD CONSTRAINT payment_orders_status_check
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled'));

COMMENT ON COLUMN public.payment_orders.status IS
  'pending=awaiting payment; processing=iyzico confirmed, creating campaign; paid=campaign started; failed/cancelled=terminal';
