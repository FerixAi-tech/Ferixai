import type { StripeCheckoutPaymentElementOptions } from "@stripe/stripe-js";

/** Express wallet row: Apple Pay + Google Pay only. */
export const expressCheckoutOptions = {
    paymentMethods: {
      applePay: "always",
      googlePay: "always",
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

/** Card form only — wallets render above via ExpressCheckoutElement. */
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

/** Server-side: card only (Apple/Google Pay use wallet buttons client-side). */
export const checkoutSessionPaymentMethodTypes = ["card"] as const;
