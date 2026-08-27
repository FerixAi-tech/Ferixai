export type CheckoutCurrency = "USD";

export function getCheckoutCharge(payableGbp: number): {
  amount: number;
  currency: CheckoutCurrency;
} {
  return {
    amount: payableGbp,
    currency: "USD",
  };
}

export function formatCheckoutCharge(
  amount: number,
  currency: CheckoutCurrency = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
