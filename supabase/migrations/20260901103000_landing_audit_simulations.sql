CREATE TABLE public.landing_audit_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  category text NOT NULL,
  business_name text NOT NULL,
  formatted_address text,
  city text,
  phone_number text,
  website_uri text,
  google_rating numeric(3, 1),
  google_review_count integer,
  place_id text,
  from_google boolean NOT NULL DEFAULT false,
  manual_entry boolean NOT NULL DEFAULT false,
  bone_question text NOT NULL,
  competitors jsonb NOT NULL DEFAULT '[]'::jsonb,
  referrer text,
  user_agent text
);

CREATE INDEX landing_audit_simulations_created_at_idx
  ON public.landing_audit_simulations(created_at DESC);

CREATE INDEX landing_audit_simulations_category_idx
  ON public.landing_audit_simulations(category);

CREATE INDEX landing_audit_simulations_business_name_idx
  ON public.landing_audit_simulations(business_name);

ALTER TABLE public.landing_audit_simulations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.landing_audit_simulations FROM anon, authenticated;
GRANT SELECT, INSERT ON public.landing_audit_simulations TO service_role;
