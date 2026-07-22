-- One-time FX30 promo code redemptions
CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS promo_redemptions_code_unique
  ON public.promo_redemptions (upper(code));

CREATE INDEX IF NOT EXISTS promo_redemptions_user_id_idx
  ON public.promo_redemptions (user_id);

ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own promo redemptions" ON public.promo_redemptions;
CREATE POLICY "Users can read own promo redemptions"
  ON public.promo_redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.promo_redemptions IS 'Tracks one-time FX30 welcome promo code usage';
