/** Google Ads account tag — override via NEXT_PUBLIC_GOOGLE_ADS_ID if needed. */
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18437354526";

/** Set when Purchase conversion action is ready in Google Ads. */
export const GOOGLE_ADS_PURCHASE_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL?.trim() ||
  "CONVERSION_LABEL";

export function isGoogleAdsTagEnabled(): boolean {
  return GOOGLE_ADS_ID.startsWith("AW-") && GOOGLE_ADS_ID.length > 5;
}

export function getGoogleAdsPurchaseSendTo(): string {
  return `${GOOGLE_ADS_ID}/${GOOGLE_ADS_PURCHASE_LABEL}`;
}

/** Purchase conversion requires NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL in env. */
export function isGoogleAdsPurchaseConfigured(): boolean {
  const label = GOOGLE_ADS_PURCHASE_LABEL;
  return (
    isGoogleAdsTagEnabled() &&
    label.length > 0 &&
    label !== "CONVERSION_LABEL"
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __ferixGoogleAdsConfigured?: boolean;
  }
}

function rememberPurchase(transactionId: string): boolean {
  if (typeof window === "undefined") return false;

  const key = `ferixai_gads_purchase:${transactionId}`;
  try {
    if (window.localStorage.getItem(key) === "1") return false;
    window.localStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}

/**
 * Browser-side Google Ads Purchase conversion.
 * Requires verified Stripe payment data from the server (see dashboard page).
 */
export function trackGoogleAdsPurchase(options: {
  value: number;
  currency: string;
  transactionId: string;
}): void {
  if (typeof window === "undefined") return;
  if (!(options.value > 0)) return;
  if (!options.transactionId.trim()) return;
  if (!isGoogleAdsPurchaseConfigured()) return;
  if (!rememberPurchase(options.transactionId)) return;

  const payload = {
    send_to: getGoogleAdsPurchaseSendTo(),
    value: options.value,
    currency: options.currency,
    transaction_id: options.transactionId,
  };

  const fire = () => {
    if (typeof window.gtag !== "function") return false;
    window.gtag("event", "conversion", payload);
    return true;
  };

  if (fire()) return;

  let attempts = 0;
  const id = window.setInterval(() => {
    attempts += 1;
    if (fire() || attempts >= 25) {
      window.clearInterval(id);
    }
  }, 100);
}
