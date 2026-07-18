REVOKE ALL ON public.ferixai_leads FROM anon, authenticated;
GRANT SELECT, INSERT ON public.ferixai_leads TO service_role;
