import type { Appearance } from "@stripe/stripe-js";

/** Matches FerixAI wizard panels (dark violet + emerald accents). */
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
    rules: {
      ".Input": {
        backgroundColor: "#0e0a18",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "none",
      },
      ".Input:focus": {
        border: "1px solid rgba(16, 185, 129, 0.45)",
        boxShadow: "0 0 0 1px rgba(16, 185, 129, 0.2)",
      },
      ".Label": {
        color: "#94a3b8",
        fontWeight: "500",
      },
      ".Tab": {
        backgroundColor: "#0e0a18",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      },
      ".Tab--selected": {
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        border: "1px solid rgba(16, 185, 129, 0.35)",
      },
      ".TabLabel--selected": {
        color: "#6ee7b7",
      },
      ".Block": {
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
      },
    },
  };
}
