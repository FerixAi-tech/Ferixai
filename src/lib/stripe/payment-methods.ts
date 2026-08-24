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

/** Server-side session restrictions for Checkout Sessions. */
export const checkoutSessionPaymentMethods = {
  payment_method_types: ["card"] as const,
  excluded_payment_method_types: [
    "amazon_pay",
    "link",
    "paypal",
    "klarna",
  ] as const,
};
