-- Monthly pricing tiers: store selected plan on campaigns
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS plan_slug text NOT NULL DEFAULT 'growth';

ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_plan_slug_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_plan_slug_check
  CHECK (plan_slug IN ('starter', 'growth', 'premium', 'agency'));

COMMENT ON COLUMN public.campaigns.plan_slug IS 'Monthly pricing tier slug (starter|growth|premium|agency)';
COMMENT ON COLUMN public.campaigns.daily_budget IS 'Legacy field: stores list monthly price (GBP) for compatibility';
COMMENT ON COLUMN public.campaigns.days IS 'Billing cycle length in days (30 for monthly plans)';
COMMENT ON COLUMN public.campaigns.total_cost IS 'Payable amount for first period (after promo if applied)';
