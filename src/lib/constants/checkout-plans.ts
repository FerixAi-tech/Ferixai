import {
  getAgencyPlanListPrice,
  getAgencyPricingPlan,
  isAgencyPlanSlug,
  type AgencyPlanSlug,
} from "@/lib/constants/agency-pricing-plans";
import {
  getPlanListPrice,
  getPricingPlan,
  isPricingPlanSlug,
  type BillingCycle,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";

export type CheckoutPlanSlug = PricingPlanSlug | AgencyPlanSlug;

const AGENCY_TO_BUSINESS_PLAN: Record<AgencyPlanSlug, PricingPlanSlug> = {
  "agency-starter": "starter",
  "agency-growth": "growth",
  "agency-domination": "premium",
};

export function isCheckoutPlanSlug(value: unknown): value is CheckoutPlanSlug {
  return isPricingPlanSlug(value) || isAgencyPlanSlug(value);
}

export function resolveCheckoutPlanSlug(
  value: unknown,
): CheckoutPlanSlug | null {
  if (typeof value !== "string") return null;
  if (value === "agency") return "agency-domination";
  return isCheckoutPlanSlug(value) ? value : null;
}

export function getCheckoutPlanName(slug: CheckoutPlanSlug): string {
  if (isAgencyPlanSlug(slug)) {
    return getAgencyPricingPlan(slug).name;
  }
  return getPricingPlan(slug).name;
}

export function getCheckoutPlanListPrice(
  slug: CheckoutPlanSlug,
  cycle: BillingCycle,
): number {
  if (isAgencyPlanSlug(slug)) {
    return getAgencyPlanListPrice(getAgencyPricingPlan(slug), cycle);
  }
  return getPlanListPrice(getPricingPlan(slug), cycle);
}

/** Business plan used for content/metrics when an agency tier is selected. */
export function getCheckoutContentPlanSlug(
  slug: CheckoutPlanSlug,
): PricingPlanSlug {
  if (isAgencyPlanSlug(slug)) {
    return AGENCY_TO_BUSINESS_PLAN[slug];
  }
  return slug;
}

export function isAgencyCheckoutPlan(slug: CheckoutPlanSlug): boolean {
  return isAgencyPlanSlug(slug);
}
