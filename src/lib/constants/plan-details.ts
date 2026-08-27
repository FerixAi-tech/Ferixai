import type { BillingCycle, PricingPlanSlug } from "@/lib/constants/pricing-plans";

export interface PlanDetailMetric {
  label: string;
  value: string;
}

export interface PlanDetails {
  metrics: PlanDetailMetric[];
  summary: string;
  yearlySummary: string;
}

export const PLAN_DETAILS: Record<PricingPlanSlug, PlanDetails> = {
  starter: {
    metrics: [
      {
        label: "AI Recommendation Volume",
        value: "Featured in ~500–1,000 AI Queries / mo",
      },
      {
        label: "Reach",
        value: "~2,500 Potential Customers / month",
      },
      {
        label: "AI Indexing Speed",
        value: "7–10 Days (Standard Rollout)",
      },
      {
        label: "Coverage",
        value: "Core local searches on ChatGPT, Gemini & Claude",
      },
      {
        label: "Tracking",
        value: "Weekly visibility updates",
      },
    ],
    summary:
      'The Starter Plan establishes a verified, district-level AI presence for your business. It ensures that when nearby customers ask ChatGPT, Gemini, or Claude for top-rated services in your specific neighborhood (e.g. "Best clinic in Business Bay" or "Top cafe in Downtown"), your business is indexed and recommended within 7–10 days.',
    yearlySummary:
      "The Starter Plan gives your business an active, verified presence across top AI platforms. It ensures that when nearby customers ask ChatGPT, Gemini, or Claude for essential services in your category, your business is indexed and recommended in standard local search queries within 7–10 days.",
  },
  growth: {
    metrics: [
      {
        label: "AI Recommendation Volume",
        value: "Featured in ~3,000–5,000 AI Queries / mo",
      },
      {
        label: "Reach",
        value: "~12,000 Potential Customers / month",
      },
      {
        label: "AI Indexing Speed",
        value: "Accelerated: 4–6 Days",
      },
      {
        label: "Coverage",
        value: "Expanded multi-query variations & high-intent searches",
      },
      {
        label: "Tracking",
        value: "Priority data refresh & active prompt monitoring",
      },
    ],
    summary:
      'The Growth Plan expands your reach across high-volume, city-wide recommendation queries. It positions your business as the premier authority when potential clients search across the entire city (e.g. "Best real estate agency in Dubai" or "Top dental clinic in Abu Dhabi"), delivering priority indexing and competitor displacement within 3–5 days.',
    yearlySummary:
      'The Annual Growth Plan delivers uninterrupted, city-wide recommendation dominance across major AI engines. It positions your brand as the leading authority across competitive, whole-city searches (e.g. "Best real estate agency in Dubai") with fast-track 48–72h indexing. Includes continuous competitor displacement, priority schema refreshes for new services, and quarterly visibility audits to maximize inbound client acquisition for 12 full months.',
  },
  premium: {
    metrics: [
      {
        label: "AI Recommendation Volume",
        value: "Featured in 10,000+ AI Queries / mo",
      },
      {
        label: "Reach",
        value: "~30,000+ Potential Customers / month",
      },
      {
        label: "AI Indexing Speed",
        value: "Ultra-Fast: Under 48 Hours",
      },
      {
        label: "Coverage",
        value: "Complete market dominance across all local & regional queries",
      },
      {
        label: "Tracking",
        value: "Real-time priority push & competitor displacement",
      },
    ],
    summary:
      'The Domination Plan delivers complete nationwide AI visibility across all Emirates. It guarantees top-tier recommendation authority for high-stakes, country-wide queries (e.g. "Best investment advisory in UAE"), backed by bespoke entity structuring and fast-track priority indexing within 24–48 hours.',
    yearlySummary:
      'The Annual Domination Plan provides complete nationwide AI market ownership across all Emirates. It secures definitive, top-tier recommendation status for high-volume, country-wide queries (e.g. "Best investment advisory in UAE") via instant priority indexing and bespoke knowledge-graph architecture. Backed by proactive model adaptation, custom entity expansion, and dedicated strategist support for full-year category dominance.',
  },
};

export function getPlanDetails(slug: PricingPlanSlug): PlanDetails {
  return PLAN_DETAILS[slug];
}

export function getPlanDetailsSummary(
  slug: PricingPlanSlug,
  billingCycle: BillingCycle,
): string {
  const details = PLAN_DETAILS[slug];
  return billingCycle === "yearly" ? details.yearlySummary : details.summary;
}
