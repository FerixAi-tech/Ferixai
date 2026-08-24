import type { StripeCheckoutPaymentElementOptions } from "@stripe/stripe-js";

/** Express wallet row: Apple Pay + Google Pay when available. */
export const expressCheckoutOptions = {
  business: { name: "FerixAI" },
  paymentMethods: {
    applePay: "auto",
    googlePay: "auto",
    amazonPay: "never",
    link: "never",
    paypal: "never",
    klarna: "never",
  },
  paymentMethodOrder: ["applePay", "googlePay"],
  layout: {
    maxColumns: 2,
    maxRows: 1,
  },
};

/** Card form — hide wallets when Express Checkout row is active. */
export const paymentElementOptions: StripeCheckoutPaymentElementOptions = {
  layout: {
    type: "tabs",
    defaultCollapsed: false,
  },
  paymentMethodOrder: ["card"],
  wallets: {
    applePay: "never",
    googlePay: "never",
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

/** Fallback when Express Checkout is unavailable on this device/browser. */
export const paymentElementWalletFallbackOptions: StripeCheckoutPaymentElementOptions =
  {
    ...paymentElementOptions,
    wallets: {
      applePay: "auto",
      googlePay: "auto",
      link: "never",
    },
  };

/** Server-side: card only (Apple/Google Pay use wallet buttons client-side). */
export const checkoutSessionPaymentMethodTypes = ["card"] as const;
