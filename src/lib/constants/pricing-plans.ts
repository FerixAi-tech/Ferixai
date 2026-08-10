import type { AggressivenessLevel } from "@/lib/campaign/content-plan";

export const PROMO_DISCOUNT_GBP = 30;
export const BILLING_CYCLE_DAYS = 30;
export const DEFAULT_BILLING_CYCLE = "monthly" as const;
export const DEFAULT_PLAN_SLUG = "premium" as const;

export type BillingCycle = typeof DEFAULT_BILLING_CYCLE;
export type PricingPlanSlug = "starter" | "growth" | "premium" | "agency";

export interface PricingPlan {
  slug: PricingPlanSlug;
  name: string;
  priceMonthlyGbp: number;
  description: string;
  badge?: "Most Popular";
  aggressiveness: AggressivenessLevel;
  /** Relative intensity used for reach / keyword estimates */
  intensityScore: number;
  siteArticleCount: number;
  blogArticleCount: number;
  devToArticleCount: number;
  boneQuestionDepth: number;
}

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    slug: "starter",
    name: "Starter Plan",
    priceMonthlyGbp: 39,
    description:
      "Index your business for ChatGPT, Gemini & Claude local recommendation queries.",
    aggressiveness: "Steady",
    intensityScore: 1,
    siteArticleCount: 1,
    blogArticleCount: 1,
    devToArticleCount: 0,
    boneQuestionDepth: 5,
  },
  {
    slug: "growth",
    name: "Growth Plan",
    priceMonthlyGbp: 59,
    description:
      "3× more AI visibility across ChatGPT, Gemini & Claude for local searches.",
    aggressiveness: "Active",
    intensityScore: 2,
    siteArticleCount: 2,
    blogArticleCount: 2,
    devToArticleCount: 1,
    boneQuestionDepth: 8,
  },
  {
    slug: "premium",
    name: "Premium Plan",
    priceMonthlyGbp: 109,
    description:
      "Aggressive ChatGPT, Gemini & Claude coverage for maximum market dominance.",
    badge: "Most Popular",
    aggressiveness: "Intensive",
    intensityScore: 3,
    siteArticleCount: 3,
    blogArticleCount: 2,
    devToArticleCount: 1,
    boneQuestionDepth: 12,
  },
  {
    slug: "agency",
    name: "Agency Plan",
    priceMonthlyGbp: 159,
    description:
      "Ultimate AI recommendation reach and top-tier indexing authority across ChatGPT, Gemini & Claude.",
    aggressiveness: "Maximum",
    intensityScore: 4,
    siteArticleCount: 3,
    blogArticleCount: 3,
    devToArticleCount: 2,
    boneQuestionDepth: 15,
  },
] as const;

export function listPricingPlans(): readonly PricingPlan[] {
  return PRICING_PLANS;
}

export function isPricingPlanSlug(value: unknown): value is PricingPlanSlug {
  return (
    typeof value === "string" &&
    PRICING_PLANS.some((plan) => plan.slug === value)
  );
}

export function getPricingPlan(slug: string): PricingPlan {
  const plan = PRICING_PLANS.find((p) => p.slug === slug);
  if (!plan) {
    throw new Error(`Unknown pricing plan: ${slug}`);
  }
  return plan;
}

export function applyPromoDiscount(
  listPrice: number,
  discountGbp: number = PROMO_DISCOUNT_GBP,
): { listPrice: number; discount: number; payable: number } {
  const discount = Math.min(Math.max(0, discountGbp), listPrice);
  return {
    listPrice,
    discount,
    payable: Math.max(0, listPrice - discount),
  };
}
