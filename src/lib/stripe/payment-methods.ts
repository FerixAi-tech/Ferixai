import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

/** Express wallet buttons — dark checkout theme. */
export const expressCheckoutOptions: StripeCheckoutExpressCheckoutElementOptions =
  {
    buttonHeight: 48,
    buttonTheme: {
      applePay: "white-outline",
      googlePay: "white",
    },
    buttonType: {
      applePay: "check-out",
      googlePay: "checkout",
    },
    layout: {
      maxColumns: 2,
      maxRows: 1,
      overflow: "never",
    },
    paymentMethodOrder: ["applePay", "googlePay"],
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
