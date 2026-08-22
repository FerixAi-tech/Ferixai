import type { PricingPlanSlug } from "@/lib/constants/pricing-plans";

export interface PlanDetailMetric {
  label: string;
  value: string;
}

export interface PlanDetails {
  metrics: PlanDetailMetric[];
  summary: string;
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
      "Designed for businesses ready to scale their lead flow. Growth accelerates your indexing to just 4–6 days and expands your footprint to thousands of specific customer search variations (pricing, top-rated, best alternatives), delivering nearly 5× more exposure to high-intent buyers in your region.",
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
      "Built for market leaders who want to outrank local competitors instantly. With priority indexing in under 48 hours and aggressive network distribution, your business becomes the #1 go-to recommendation across 10,000+ monthly AI queries across your entire city and surrounding areas.",
  },
};

export function getPlanDetails(slug: PricingPlanSlug): PlanDetails {
  return PLAN_DETAILS[slug];
}
