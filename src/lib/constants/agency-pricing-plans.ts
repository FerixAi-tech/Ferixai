import type { BillingCycle } from "@/lib/constants/pricing-plans";

export type AgencyPlanSlug =
  | "agency-starter"
  | "agency-growth"
  | "agency-domination";

export interface AgencyPricingPlan {
  slug: AgencyPlanSlug;
  name: string;
  priceMonthlyAed: number;
  priceYearlyAed: number;
  yearlySavingsAed: number;
  badge?: "Most Popular";
  description: string;
  monthlyCapacity: string;
  yearlyGrowth: string;
  features: readonly string[];
}

export const AGENCY_PRICING_PLANS: readonly AgencyPricingPlan[] = [
  {
    slug: "agency-starter",
    name: "Agency Starter",
    priceMonthlyAed: 1499,
    priceYearlyAed: 14999,
    yearlySavingsAed: 2989,
    description:
      "Launch a multi-client AEO practice with unified onboarding and citation tracking.",
    monthlyCapacity: "Manage up to 5 business profiles simultaneously",
    yearlyGrowth:
      "Includes 5 initial client slots, plus add +5 new business slots every month throughout the year",
    features: [
      "Multi-client unified dashboard",
      "Dedicated AEO & GEO indexing per business",
      "Standard AI citation tracking (ChatGPT, Gemini, Perplexity)",
      "Email support & multi-business onboarding form",
    ],
  },
  {
    slug: "agency-growth",
    name: "Agency Growth",
    priceMonthlyAed: 2999,
    priceYearlyAed: 29999,
    yearlySavingsAed: 5989,
    description:
      "Scale client delivery with faster ingestion, performance tracking, and priority support.",
    monthlyCapacity: "Manage up to 10 business profiles simultaneously",
    yearlyGrowth:
      "Includes 10 initial client slots, plus add +10 new business slots every month throughout the year",
    features: [
      "Everything in Starter",
      "Accelerated vector ingestion & schema sync",
      "Client performance tracking",
      "Priority support queue",
    ],
  },
  {
    slug: "agency-domination",
    name: "Agency Domination",
    priceMonthlyAed: 3999,
    priceYearlyAed: 34999,
    yearlySavingsAed: 12989,
    badge: "Most Popular",
    description:
      "Maximum authority, dedicated account management, and highest-margin agency operations.",
    monthlyCapacity: "Manage up to 20 business profiles simultaneously",
    yearlyGrowth:
      "Includes 20 initial client slots, plus add +20 new business slots every month throughout the year",
    features: [
      "Everything in Growth",
      "Maximum AI search engine authority & high-frequency updates",
      "Dedicated account manager & custom onboarding flow",
      "Highest margin optimization for agencies",
    ],
  },
] as const;

export const AGENCY_BILLING_CYCLE_NOTE =
  "All client slots share the primary billing cycle from the date of activation.";

export const MAX_AGENCY_YEARLY_SAVINGS_AED = Math.max(
  ...AGENCY_PRICING_PLANS.map((plan) => plan.yearlySavingsAed),
);

export function listAgencyPricingPlans(): readonly AgencyPricingPlan[] {
  return AGENCY_PRICING_PLANS;
}

export function getAgencyPlanListPrice(
  plan: AgencyPricingPlan,
  cycle: BillingCycle,
): number {
  return cycle === "yearly" ? plan.priceYearlyAed : plan.priceMonthlyAed;
}

export function getAgencyPlanYearlySavings(plan: AgencyPricingPlan): number {
  return plan.yearlySavingsAed;
}

export function getAgencyCapacityLabel(
  plan: AgencyPricingPlan,
  cycle: BillingCycle,
): string {
  return cycle === "yearly" ? plan.yearlyGrowth : plan.monthlyCapacity;
}
