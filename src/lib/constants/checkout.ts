/**
 * TEMPORARY — Meta Pixel / live checkout test.
 *
 * When `enabled` is true, every paid iyzico checkout charges 1.00 TRY
 * instead of the plan’s GBP amount. Package list prices in
 * `pricing-plans.ts` stay in sterling so flipping this back restores
 * normal GBP charging without re-entering plan prices.
 *
 * To restore production GBP checkout: set `enabled` to `false`.
 */
export const TEMPORARY_TRY_ONE_LIRA_CHECKOUT = {
  enabled: true,
  amount: 1,
  currency: "TRY",
} as const;

export type CheckoutCurrency = "GBP" | "TRY";

export function getIyzicoCheckoutCharge(payableGbp: number): {
  amount: number;
  currency: CheckoutCurrency;
  /** True while the temporary ₺1 override is active. */
  isTemporaryTryTest: boolean;
} {
  if (TEMPORARY_TRY_ONE_LIRA_CHECKOUT.enabled) {
    return {
      amount: TEMPORARY_TRY_ONE_LIRA_CHECKOUT.amount,
      currency: TEMPORARY_TRY_ONE_LIRA_CHECKOUT.currency,
      isTemporaryTryTest: true,
    };
  }

  return {
    amount: payableGbp,
    currency: "GBP",
    isTemporaryTryTest: false,
  };
}

export function formatCheckoutCharge(
  amount: number,
  currency: CheckoutCurrency,
): string {
  return new Intl.NumberFormat(currency === "TRY" ? "tr-TR" : "en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}
