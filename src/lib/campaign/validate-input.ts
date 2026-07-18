import { BUDGET_MAX, BUDGET_MIN, DAYS_MAX, DAYS_MIN } from "@/lib/constants/metrics";
import { isManufacturerCategory } from "@/lib/constants/categories";

export interface CampaignInput {
  businessName: string;
  category: string;
  city: string;
  dailyBudget: number;
  days: number;
  productDescription?: string | null;
}

export function validateCampaignInput(body: unknown): CampaignInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request");
  }

  const { businessName, category, city, dailyBudget, days, productDescription } =
    body as Record<string, unknown>;

  if (
    !businessName ||
    !category ||
    !city ||
    dailyBudget === undefined ||
    days === undefined
  ) {
    throw new Error("All fields are required");
  }

  const budget = Number(dailyBudget);
  const dayCount = Number(days);

  if (!Number.isFinite(budget) || budget < BUDGET_MIN || budget > BUDGET_MAX) {
    throw new Error(`Daily plan must be between £${BUDGET_MIN} and £${BUDGET_MAX}`);
  }

  if (!Number.isFinite(dayCount) || dayCount < DAYS_MIN || dayCount > DAYS_MAX) {
    throw new Error(`Campaign length must be between ${DAYS_MIN} and ${DAYS_MAX} days`);
  }

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
    dailyBudget: budget,
    days: dayCount,
    productDescription: isManufacturerCategory(categoryName) ? product : null,
  };
}

/** Payment is off unless FERIXAI_PAYMENT_REQUIRED=true (Stripe later). */
export function isPaymentBypassEnabled(): boolean {
  return process.env.FERIXAI_PAYMENT_REQUIRED !== "true";
}
