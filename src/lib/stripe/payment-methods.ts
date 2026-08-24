import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

function isApplePayBrowser(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari =
    /safari/.test(ua) && !/chrome|chromium|crios|fxios|edg\//.test(ua);
  return isIos || isSafari;
}

/** Express wallets — Safari gets Apple Pay always; Chrome gets Google Pay always. */
export function getExpressCheckoutOptions(
  userAgent: string,
): StripeCheckoutExpressCheckoutElementOptions {
  const applePayBrowser = isApplePayBrowser(userAgent);

  return {
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
    paymentMethodOrder: applePayBrowser
      ? ["applePay", "googlePay"]
      : ["googlePay", "applePay"],
    paymentMethods: {
      applePay: applePayBrowser ? "always" : "auto",
      googlePay: applePayBrowser ? "auto" : "always",
      amazonPay: "never",
      link: "never",
      paypal: "never",
      klarna: "never",
    },
  };
}

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

export const checkoutSessionPaymentMethodTypes = ["card"] as const;
