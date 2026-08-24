import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

/** Minimal express options — Stripe defaults + block unwanted wallets. */
export const expressCheckoutOptions: StripeCheckoutExpressCheckoutElementOptions =
  {
    paymentMethods: {
      applePay: "auto",
      googlePay: "auto",
      amazonPay: "never",
      link: "never",
      paypal: "never",
      klarna: "never",
    },
  };

/** Card form — wallets render via ExpressCheckoutElement above. */
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

/** Server-side: card enables Apple Pay / Google Pay client-side. */
export const checkoutSessionPaymentMethodTypes = ["card"] as const;
