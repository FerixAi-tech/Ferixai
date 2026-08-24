import type {
  StripeCheckoutExpressCheckoutElementOptions,
  StripeCheckoutPaymentElementOptions,
} from "@stripe/stripe-js";

const billingFields: StripeCheckoutPaymentElementOptions["fields"] = {
  billingDetails: {
    name: "always",
    address: {
      country: "never",
    },
  },
};

/** Safari / iOS — Apple Pay lives here; Express is stable on these browsers. */
export function isApplePayPlatform(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari =
    /safari/.test(ua) && !/chrome|chromium|crios|fxios|edg\//.test(ua);
  return isIos || isSafari;
}

/** Card form below Express — wallets render in Express row only. */
export const cardOnlyPaymentElementOptions: StripeCheckoutPaymentElementOptions =
  {
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
    fields: billingFields,
  };

/** Safari Express row — Apple Pay + Google Pay when available. */
export function getSafariExpressCheckoutOptions(): StripeCheckoutExpressCheckoutElementOptions {
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
    paymentMethodOrder: ["applePay", "googlePay"],
    paymentMethods: {
      applePay: "always",
      googlePay: "auto",
      amazonPay: "never",
      link: "never",
      paypal: "never",
      klarna: "never",
    },
  };
}

/**
 * Chrome / Android / desktop — Google Pay via Express only.
 * Apple Pay must stay "never" here; forcing it crashes non-Safari browsers.
 */
export function getChromeExpressCheckoutOptions(): StripeCheckoutExpressCheckoutElementOptions {
  return {
    buttonHeight: 48,
    buttonTheme: {
      googlePay: "white",
    },
    buttonType: {
      googlePay: "checkout",
    },
    layout: {
      maxColumns: 1,
      maxRows: 1,
      overflow: "auto",
    },
    paymentMethodOrder: ["googlePay"],
    paymentMethods: {
      applePay: "never",
      googlePay: "always",
      amazonPay: "never",
      link: "never",
      paypal: "never",
      klarna: "never",
    },
  };
}

export function getExpressCheckoutOptions(
  userAgent: string,
): StripeCheckoutExpressCheckoutElementOptions {
  return isApplePayPlatform(userAgent)
    ? getSafariExpressCheckoutOptions()
    : getChromeExpressCheckoutOptions();
}

export function getExpressSectionLabel(userAgent: string): string {
  return isApplePayPlatform(userAgent) ? "Apple Pay · Google Pay" : "Google Pay";
}

export function getPaymentElementOptions(
  userAgent: string,
): StripeCheckoutPaymentElementOptions {
  void userAgent;
  return cardOnlyPaymentElementOptions;
}

export function getPaymentSectionLabel(userAgent: string): string {
  void userAgent;
  return "Debit or credit card";
}

export const checkoutSessionPaymentMethodTypes = ["card"] as const;
