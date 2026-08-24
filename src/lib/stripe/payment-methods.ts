import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

/** Express wallet buttons — force render when domain is verified. */
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
      applePay: "always",
      googlePay: "always",
      amazonPay: "never",
      link: "never",
      paypal: "never",
      klarna: "never",
    },
  };

/** Card form — wallets render via ExpressCheckoutElement above. */
export const paymentElementOptions: StripeCheckoutPaymentElementOptions = {
  layout: {
    type: "accordion",
    defaultCollapsed: false,
    radios: "never",
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
