import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

/** Express wallets — full Checkout-mode options (partial config crashes the iframe). */
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

/** Fallback if Express iframe fails — wallets inside Payment Element. */
export const paymentElementWalletFallbackOptions: StripeCheckoutPaymentElementOptions =
  {
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

export const checkoutSessionPaymentMethodTypes = ["card"] as const;
