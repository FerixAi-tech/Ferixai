import type { AggressivenessLevel } from "@/lib/campaign/content-plan";

export const PROMO_DISCOUNT_GBP = 30;
export const BILLING_CYCLE_DAYS = 30;
export const BILLING_CYCLE_YEARLY_DAYS = 365;
export const DEFAULT_BILLING_CYCLE = "monthly" as const;
export const DEFAULT_PLAN_SLUG = "growth" as const;

export type BillingCycle = "monthly" | "yearly";

export type PricingPlanSlug = "starter" | "growth" | "premium";

export interface PricingPlan {
  slug: PricingPlanSlug;
  name: string;
  priceMonthlyGbp: number;
  compareAtMonthlyAed: number;
  priceYearlyAed: number;
  compareAtYearlyAed: number;
  yearlySavingsAed: number;
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
    priceMonthlyGbp: 79,
    compareAtMonthlyAed: 99,
    priceYearlyAed: 690,
    compareAtYearlyAed: 948,
    yearlySavingsAed: 258,
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
    priceMonthlyGbp: 149,
    compareAtMonthlyAed: 179,
    priceYearlyAed: 1290,
    compareAtYearlyAed: 1788,
    yearlySavingsAed: 498,
    description:
      "3× more AI visibility across ChatGPT, Gemini & Claude for local searches.",
    badge: "Most Popular",
    aggressiveness: "Active",
    intensityScore: 2,
    siteArticleCount: 2,
    blogArticleCount: 2,
    devToArticleCount: 1,
    boneQuestionDepth: 8,
  },
  {
    slug: "premium",
    name: "Domination Plan",
    priceMonthlyGbp: 299,
    compareAtMonthlyAed: 349,
    priceYearlyAed: 2490,
    compareAtYearlyAed: 3588,
    yearlySavingsAed: 1098,
    description:
      "Aggressive ChatGPT, Gemini & Claude coverage for maximum market dominance.",
    aggressiveness: "Intensive",
    intensityScore: 3,
    siteArticleCount: 3,
    blogArticleCount: 2,
    devToArticleCount: 1,
    boneQuestionDepth: 12,
  },
] as const;

export const MAX_YEARLY_SAVINGS_AED = Math.max(
  ...PRICING_PLANS.map((plan) => plan.yearlySavingsAed),
);

export const MAX_MONTHLY_SAVINGS_AED = Math.max(
  ...PRICING_PLANS.map(
    (plan) => plan.compareAtMonthlyAed - plan.priceMonthlyGbp,
  ),
);

export function isBillingCycle(value: unknown): value is BillingCycle {
  return value === "monthly" || value === "yearly";
}

export function getBillingCycleDays(cycle: BillingCycle): number {
  return cycle === "yearly" ? BILLING_CYCLE_YEARLY_DAYS : BILLING_CYCLE_DAYS;
}

export function getPlanListPrice(
  plan: PricingPlan,
  cycle: BillingCycle,
): number {
  return cycle === "yearly" ? plan.priceYearlyAed : plan.priceMonthlyGbp;
}

export function getPlanCompareAtPrice(
  plan: PricingPlan,
  cycle: BillingCycle,
): number {
  return cycle === "yearly" ? plan.compareAtYearlyAed : plan.compareAtMonthlyAed;
}

export function getPlanYearlySavings(plan: PricingPlan): number {
  return plan.yearlySavingsAed;
}

export function getBillingPeriodLabel(cycle: BillingCycle): string {
  return cycle === "yearly" ? "year" : "month";
}

export function listPricingPlans(): readonly PricingPlan[] {
  return PRICING_PLANS;
}

/** Maps legacy slugs (e.g. agency) to current plan tiers. */
export function resolvePricingPlanSlug(
  value: unknown,
): PricingPlanSlug | null {
  if (typeof value !== "string") return null;
  if (value === "agency") return "premium";
  return isPricingPlanSlug(value) ? value : null;
}

export function isPricingPlanSlug(value: unknown): value is PricingPlanSlug {
  if (typeof value !== "string") return false;
  if (value === "agency") return false;
  return PRICING_PLANS.some((plan) => plan.slug === value);
}

export function getPricingPlan(slug: string): PricingPlan {
  const normalized = slug === "agency" ? "premium" : slug;
  const plan = PRICING_PLANS.find((p) => p.slug === normalized);
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
