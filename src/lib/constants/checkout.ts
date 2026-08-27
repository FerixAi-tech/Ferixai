export type CheckoutCurrency = "AED";

export function getCheckoutCharge(payableGbp: number): {
  amount: number;
  currency: CheckoutCurrency;
} {
  return {
    amount: payableGbp,
    currency: "AED",
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
