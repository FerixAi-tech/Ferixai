-- Introduce billing_cycle; stop relying on daily_budget / days
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly';

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_billing_cycle_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_billing_cycle_check
  CHECK (billing_cycle IN ('monthly'));

-- Deprecate slider-era columns (keep for historical rows, allow NULL going forward)
ALTER TABLE public.campaigns
  ALTER COLUMN daily_budget DROP NOT NULL;

ALTER TABLE public.campaigns
  ALTER COLUMN days DROP NOT NULL;

COMMENT ON COLUMN public.campaigns.billing_cycle IS 'Subscription billing cycle (monthly)';
COMMENT ON COLUMN public.campaigns.daily_budget IS 'DEPRECATED — unused for new monthly plans';
COMMENT ON COLUMN public.campaigns.days IS 'DEPRECATED — unused for new monthly plans; ends_at uses billing cycle';
