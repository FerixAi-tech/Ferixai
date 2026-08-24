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

/** Safari / iOS — Express Checkout is stable here. */
export function isApplePayPlatform(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari =
    /safari/.test(ua) && !/chrome|chromium|crios|fxios|edg\//.test(ua);
  return isIos || isSafari;
}

/** Chrome / Android / desktop — skip Express; use Payment Element wallets. */
export function shouldMountExpressCheckout(userAgent: string): boolean {
  return isApplePayPlatform(userAgent);
}

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

/** Safari — card only below Express (wallets are in Express row). */
export const safariPaymentElementOptions: StripeCheckoutPaymentElementOptions =
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

/** Chrome / Android — no Express; Google Pay + card in one element. */
export const chromePaymentElementOptions: StripeCheckoutPaymentElementOptions =
  {
    layout: {
      type: "accordion",
      defaultCollapsed: false,
      radios: "always",
    },
    paymentMethodOrder: ["google_pay", "card"],
    wallets: {
      applePay: "never",
      googlePay: "auto",
      link: "never",
    },
    fields: billingFields,
  };

export function getPaymentElementOptions(
  userAgent: string,
): StripeCheckoutPaymentElementOptions {
  return shouldMountExpressCheckout(userAgent)
    ? safariPaymentElementOptions
    : chromePaymentElementOptions;
}

export function getPaymentSectionLabel(userAgent: string): string {
  return shouldMountExpressCheckout(userAgent)
    ? "Debit or credit card"
    : "Pay with Google Pay or card";
}

export const checkoutSessionPaymentMethodTypes = ["card"] as const;
