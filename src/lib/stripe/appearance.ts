import type { Appearance } from "@stripe/stripe-js";

/** Dark FerixAI theme — variables only (custom rules can break Checkout wallets). */
export function getStripeCheckoutAppearance(): Appearance {
  return {
    theme: "night",
    variables: {
      colorPrimary: "#10b981",
      colorPrimaryText: "#ecfdf5",
      colorBackground: "#120c1e",
      colorText: "#e2e8f0",
      colorTextSecondary: "#94a3b8",
      colorTextPlaceholder: "#64748b",
      colorDanger: "#f87171",
      borderRadius: "12px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      spacingUnit: "4px",
    },
  };
}
