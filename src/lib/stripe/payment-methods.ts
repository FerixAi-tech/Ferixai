import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

/** Both wallets requested — Stripe shows each button only where the OS/browser allows. */
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
      name: "always",
      address: {
        country: "never",
      },
    },
  },
};

export const checkoutSessionPaymentMethodTypes = ["card"] as const;
