import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

function isApplePayPlatform(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari =
    /safari/.test(ua) && !/chrome|chromium|crios|fxios|edg\//.test(ua);
  return isIos || isSafari;
}

function isAndroid(userAgent: string): boolean {
  return /android/i.test(userAgent);
}

/**
 * Platform-safe Express options — Apple Pay "always" crashes Android Chrome.
 * Safari/iOS: both wallets. Android/desktop Chrome: Google Pay only.
 */
export function getExpressCheckoutOptions(
  userAgent: string,
): StripeCheckoutExpressCheckoutElementOptions {
  const applePlatform = isApplePayPlatform(userAgent);
  const android = isAndroid(userAgent);

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
      maxColumns: applePlatform ? 2 : 1,
      maxRows: 1,
      overflow: "auto",
    },
    paymentMethodOrder: applePlatform
      ? ["applePay", "googlePay"]
      : ["googlePay"],
    paymentMethods: {
      applePay: applePlatform ? "always" : "never",
      googlePay: android || !applePlatform ? "always" : "auto",
      amazonPay: "never",
      link: "never",
      paypal: "never",
      klarna: "never",
    },
  };
}

export function getWalletSectionLabel(userAgent: string): string {
  return isApplePayPlatform(userAgent)
    ? "Apple Pay · Google Pay"
    : "Google Pay";
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
      name: "always",
      address: {
        country: "never",
      },
    },
  },
};

export const checkoutSessionPaymentMethodTypes = ["card"] as const;
