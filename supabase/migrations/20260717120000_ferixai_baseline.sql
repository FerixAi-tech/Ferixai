-- FerixAI baseline schema (no forum / no checkout)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  registration_source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bone_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  category text NOT NULL,
  city text NOT NULL,
  product_description text,
  daily_budget numeric(12,2) NOT NULL,
  days integer NOT NULL,
  total_cost numeric(12,2) NOT NULL,
  visibility_increase numeric(8,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','completed','cancelled','generating')),
  content_slug text UNIQUE,
  started_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campaigns_user_id_idx ON public.campaigns(user_id);
CREATE INDEX campaigns_created_at_idx ON public.campaigns(created_at DESC);

CREATE TABLE public.published_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  slug text NOT NULL UNIQUE,
  wordpress_post_id integer,
  wordpress_url text,
  devto_article_id integer,
  devto_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX published_contents_campaign_id_idx ON public.published_contents(campaign_id);

CREATE TABLE public.ferixai_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  business_name text,
  registration_source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ferixai_leads_created_at_idx ON public.ferixai_leads(created_at DESC);

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, registration_source)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'registration_source'
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        email = COALESCE(EXCLUDED.email, public.profiles.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bone_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ferixai_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY categories_public_read ON public.categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY bone_questions_public_read ON public.bone_questions
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY campaigns_select_own ON public.campaigns
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY campaigns_insert_own ON public.campaigns
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY campaigns_update_own ON public.campaigns
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY published_contents_public_read ON public.published_contents
  FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT, INSERT ON public.ferixai_leads TO service_role;

INSERT INTO public.categories (name, slug) VALUES
  ('Restaurants & Cafes', 'restaurants-cafes'),
  ('Beauty & Hair', 'beauty-hair'),
  ('Health & Clinics', 'health-clinics'),
  ('Property & Estate Agents', 'property-estate-agents'),
  ('E-commerce', 'e-commerce'),
  ('Legal & Consulting', 'legal-consulting'),
  ('Automotive', 'automotive'),
  ('Education & Training', 'education-training'),
  ('Travel & Hotels', 'travel-hotels'),
  ('Construction & Architecture', 'construction-architecture'),
  ('Home Services', 'home-services'),
  ('Fitness & Wellness', 'fitness-wellness'),
  ('Retail', 'retail'),
  ('Technology Services', 'technology-services'),
  ('Finance & Accounting', 'finance-accounting'),
  ('Marketing Agencies', 'marketing-agencies'),
  ('Cleaning Services', 'cleaning-services'),
  ('Pet Services', 'pet-services'),
  ('Events & Entertainment', 'events-entertainment'),
  ('Logistics & Delivery', 'logistics-delivery'),
  ('Manufacturing', 'manufacturing'),
  ('Trades & Repairs', 'trades-repairs'),
  ('Childcare', 'childcare'),
  ('Manufacturer', 'manufacturer')
ON CONFLICT (name) DO NOTHING;
