export type CheckoutCurrency = "GBP";

export function getCheckoutCharge(payableGbp: number): {
  amount: number;
  currency: CheckoutCurrency;
} {
  return {
    amount: payableGbp,
    currency: "GBP",
  };
}

export function formatCheckoutCharge(
  amount: number,
  currency: CheckoutCurrency = "GBP",
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}
