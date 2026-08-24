import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

/** Express wallets — Google Pay forced visible on Chrome when domain is verified. */
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
      overflow: "auto",
    },
    paymentMethodOrder: ["googlePay", "applePay"],
    paymentMethods: {
      applePay: "auto",
      googlePay: "always",
      amazonPay: "never",
      link: "never",
      paypal: "never",
      klarna: "never",
    },
  };

/** Card-only while Express row is active above. */
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

/** Shown when Express renders no wallet buttons. */
export const paymentElementWalletFallbackOptions: StripeCheckoutPaymentElementOptions =
  {
    layout: {
      type: "accordion",
      defaultCollapsed: false,
      radios: "always",
    },
    paymentMethodOrder: ["google_pay", "apple_pay", "card"],
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

export const checkoutSessionPaymentMethodTypes = ["card"] as const;
