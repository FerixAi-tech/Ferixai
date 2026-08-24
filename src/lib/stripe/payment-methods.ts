import type { StripeCheckoutPaymentElementOptions } from "@stripe/stripe-js";

/** Wallets + card in one Payment Element (no separate Express iframe). */
export const paymentElementOptions: StripeCheckoutPaymentElementOptions = {
  layout: {
    type: "accordion",
    defaultCollapsed: false,
    radios: "always",
  },
  wallets: {
    applePay: "auto",
    googlePay: "auto",
    link: "never",
  },
  fields: {
    billingDetails: {
      address: {
        country: "never",
      },
    },
  },
};

/** Server-side: card enables Apple Pay / Google Pay wallets client-side. */
export const checkoutSessionPaymentMethodTypes = ["card"] as const;
