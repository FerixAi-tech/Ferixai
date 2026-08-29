import type { BillingCycle, PricingPlanSlug } from "@/lib/constants/pricing-plans";

/** Landing-page currency display for the Netherlands market (English copy, EUR). */
export function formatLandingCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const LANDING_PLAN_SUMMARIES: Record<
  PricingPlanSlug,
  { summary: string; yearlySummary: string }
> = {
  starter: {
    summary:
      'The Starter Plan establishes a verified, district-level AI presence for your business. It ensures that when nearby customers ask ChatGPT, Gemini, or Claude for top-rated services in your specific neighborhood (e.g. "Best clinic in De Pijp" or "Top cafe in Jordaan"), your business is indexed and recommended within 7–10 days.',
    yearlySummary:
      "The Starter Plan gives your business an active, verified presence across top AI platforms. It ensures that when nearby customers ask ChatGPT, Gemini, or Claude for essential services in your category, your business is indexed and recommended in standard local search queries within 7–10 days.",
  },
  growth: {
    summary:
      'The Growth Plan expands your reach across high-volume, city-wide recommendation queries. It positions your business as the premier authority when potential clients search across the entire city (e.g. "Best real estate agency in Amsterdam" or "Top dental clinic in Rotterdam"), delivering priority indexing and competitor displacement within 3–5 days.',
    yearlySummary:
      'The Annual Growth Plan delivers uninterrupted, city-wide recommendation dominance across major AI engines. It positions your brand as the leading authority across competitive, whole-city searches (e.g. "Best real estate agency in Amsterdam") with fast-track 48–72h indexing. Includes continuous competitor displacement, priority schema refreshes for new services, and quarterly visibility audits to maximize inbound client acquisition for 12 full months.',
  },
  premium: {
    summary:
      'The Domination Plan delivers complete nationwide AI visibility across the Netherlands. It guarantees top-tier recommendation authority for high-stakes, country-wide queries (e.g. "Best investment advisory in the Netherlands"), backed by bespoke entity structuring and fast-track priority indexing within 24–48 hours.',
    yearlySummary:
      'The Annual Domination Plan provides complete nationwide AI market ownership across all Dutch provinces. It secures definitive, top-tier recommendation status for high-volume, country-wide queries (e.g. "Best investment advisory in the Netherlands") via instant priority indexing and bespoke knowledge-graph architecture. Backed by proactive model adaptation, custom entity expansion, and dedicated strategist support for full-year category dominance.',
  },
};

export function getLandingPlanDetailsSummary(
  slug: PricingPlanSlug,
  billingCycle: BillingCycle,
): string {
  const details = LANDING_PLAN_SUMMARIES[slug];
  return billingCycle === "yearly" ? details.yearlySummary : details.summary;
}
