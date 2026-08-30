export type CheckoutCurrency = "AED";

export const CHECKOUT_CURRENCY: CheckoutCurrency = "AED";

export function getCheckoutCharge(payableAmount: number): {
  amount: number;
  currency: CheckoutCurrency;
} {
  return {
    amount: payableAmount,
    currency: CHECKOUT_CURRENCY,
  };
}

export function formatCheckoutCharge(
  amount: number,
  currency: CheckoutCurrency = "AED",
): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
