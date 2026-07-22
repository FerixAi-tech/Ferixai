import {
  applyPromoDiscount,
  BILLING_CYCLE_DAYS,
  DEFAULT_BILLING_CYCLE,
  getPricingPlan,
  isPricingPlanSlug,
  PROMO_DISCOUNT_GBP,
  type BillingCycle,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import { isManufacturerCategory } from "@/lib/constants/categories";

export interface CampaignInput {
  businessName: string;
  category: string;
  city: string;
  planSlug: PricingPlanSlug;
  billingCycle: BillingCycle;
  /** List monthly price (GBP) */
  listPriceGbp: number;
  /** Payable first-period amount after promo */
  totalCostGbp: number;
  promoApplied: boolean;
  discountGbp: number;
  productDescription?: string | null;
}

export function validateCampaignInput(body: unknown): CampaignInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request");
  }

  const {
    businessName,
    category,
    city,
    planSlug,
    promoApplied,
    productDescription,
  } = body as Record<string, unknown>;

  if (!businessName || !category || !city || !planSlug) {
    throw new Error("All fields are required");
  }

  if (!isPricingPlanSlug(planSlug)) {
    throw new Error("Please select a valid pricing plan");
  }

  const plan = getPricingPlan(planSlug);
  const applied = promoApplied === true;
  const discountGbp = applied ? PROMO_DISCOUNT_GBP : 0;
  const { listPrice, payable } = applyPromoDiscount(
    plan.priceMonthlyGbp,
    discountGbp,
  );

  const name = String(businessName).trim();
  if (name.length < 2) {
    throw new Error("Business name must be at least 2 characters");
  }

  const categoryName = String(category);
  const product =
    productDescription === undefined || productDescription === null
      ? null
      : String(productDescription).trim();

  if (isManufacturerCategory(categoryName)) {
    if (!product || product.length < 3) {
      throw new Error("Please describe what you manufacture (at least 3 characters)");
    }
    if (product.length > 300) {
      throw new Error("Product description must be 300 characters or fewer");
    }
  }

  return {
    businessName: name,
    category: categoryName,
    city: String(city),
    planSlug,
    billingCycle: DEFAULT_BILLING_CYCLE,
    listPriceGbp: listPrice,
    totalCostGbp: payable,
    promoApplied: applied,
    discountGbp,
    productDescription: isManufacturerCategory(categoryName) ? product : null,
  };
}

/** Payment bypass when FERIXAI_PAYMENT_REQUIRED is not "true". */
export function isPaymentBypassEnabled(): boolean {
  return process.env.FERIXAI_PAYMENT_REQUIRED !== "true";
}

export { BILLING_CYCLE_DAYS };
