export type CheckoutCurrency = "EUR";

export const CHECKOUT_CURRENCY: CheckoutCurrency = "EUR";

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
  currency: CheckoutCurrency = "EUR",
): string {
  return new Intl.NumberFormat("en-NL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
