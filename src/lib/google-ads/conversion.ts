/** Google Ads account tag — override via NEXT_PUBLIC_GOOGLE_ADS_ID if needed. */
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18437354526";

/**
 * Purchase conversion label from Google Ads → Goals → Conversions → Purchase.
 * User-provided production label; env overrides if set.
 */
export const GOOGLE_ADS_PURCHASE_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL?.trim() ||
  "M287CMLQ_PAcEJ7oztdE";

/**
 * Sign-up / lead conversion label from Google Ads → Goals → Conversions.
 * Required for Leads campaigns (Maximize Conversions). Never invent this value.
 */
export const GOOGLE_ADS_SIGNUP_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL?.trim() || "";

/** Query flag so Ads can also use a page-load conversion after registration. */
export const GOOGLE_ADS_SIGNUP_QUERY_KEY = "registered";
export const GOOGLE_ADS_SIGNUP_QUERY_VALUE = "1";

const GTAG_RETRY_MS = 100;
const GTAG_RETRY_ATTEMPTS = 20;
const GTAG_EVENT_TIMEOUT_MS = 2000;

export function isGoogleAdsTagEnabled(): boolean {
  return GOOGLE_ADS_ID.startsWith("AW-") && GOOGLE_ADS_ID.length > 5;
}

export function getGoogleAdsPurchaseSendTo(): string {
  return `${GOOGLE_ADS_ID}/${GOOGLE_ADS_PURCHASE_LABEL}`;
}

export function getGoogleAdsSignupSendTo(): string {
  return `${GOOGLE_ADS_ID}/${GOOGLE_ADS_SIGNUP_LABEL}`;
}

export function isGoogleAdsPurchaseConfigured(): boolean {
  return isGoogleAdsTagEnabled() && GOOGLE_ADS_PURCHASE_LABEL.length > 0;
}

export function isGoogleAdsSignupConfigured(): boolean {
  return isGoogleAdsTagEnabled() && GOOGLE_ADS_SIGNUP_LABEL.length > 0;
}

export function withGoogleAdsSignupQuery(path: string): string {
  try {
    const absolute = path.startsWith("http")
      ? path
      : `https://www.ferixai.com${path.startsWith("/") ? path : `/${path}`}`;
    const url = new URL(absolute);
    url.searchParams.set(
      GOOGLE_ADS_SIGNUP_QUERY_KEY,
      GOOGLE_ADS_SIGNUP_QUERY_VALUE,
    );
    return path.startsWith("http")
      ? url.toString()
      : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return path;
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __ferixGoogleAdsConfigured?: boolean;
  }
}

function storageKey(kind: "purchase" | "signup", id: string): string {
  return `ferixai_gads_${kind}:${id}`;
}

function hasRecorded(kind: "purchase" | "signup", id: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(storageKey(kind, id)) === "1";
  } catch {
    return false;
  }
}

function record(kind: "purchase" | "signup", id: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(kind, id), "1");
  } catch {
    // ignore quota / privacy mode
  }
}

function applyUserData(email?: string): void {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed || typeof window.gtag !== "function") return;
  window.gtag("set", "user_data", { email: trimmed });
}

function fireGtagConversion(
  payload: Record<string, unknown>,
  options: { email?: string; onSuccess: () => void },
): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    const fire = () => {
      if (typeof window.gtag !== "function") return false;
      applyUserData(options.email);
      window.gtag("event", "conversion", {
        ...payload,
        event_timeout: GTAG_EVENT_TIMEOUT_MS,
        event_callback: () => {
          options.onSuccess();
          finish(true);
        },
      });
      return true;
    };

    if (fire()) {
      window.setTimeout(() => finish(false), GTAG_EVENT_TIMEOUT_MS + 50);
      return;
    }

    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      if (fire()) {
        window.clearInterval(id);
        window.setTimeout(() => finish(false), GTAG_EVENT_TIMEOUT_MS + 50);
        return;
      }
      if (attempts >= GTAG_RETRY_ATTEMPTS) {
        window.clearInterval(id);
        finish(false);
      }
    }, GTAG_RETRY_MS);
  });
}

/**
 * Browser-side Google Ads Purchase conversion.
 * Requires verified Stripe payment data from the server (see dashboard page).
 */
export async function trackGoogleAdsPurchase(options: {
  value: number;
  currency: string;
  transactionId: string;
  email?: string;
}): Promise<void> {
  if (typeof window === "undefined") return;
  if (!(options.value > 0)) return;
  const transactionId = options.transactionId.trim();
  if (!transactionId) return;
  if (!isGoogleAdsPurchaseConfigured()) return;
  if (hasRecorded("purchase", transactionId)) return;

  await fireGtagConversion(
    {
      send_to: getGoogleAdsPurchaseSendTo(),
      value: options.value,
      currency: options.currency,
      transaction_id: transactionId,
    },
    {
      email: options.email,
      onSuccess: () => record("purchase", transactionId),
    },
  );
}

/** Browser-side Google Ads Sign-up conversion after a real account is created. */
export async function trackGoogleAdsSignup(options: {
  userId: string;
  email?: string;
}): Promise<void> {
  if (typeof window === "undefined") return;
  const userId = options.userId.trim();
  if (!userId) return;
  if (!isGoogleAdsSignupConfigured()) return;
  if (hasRecorded("signup", userId)) return;

  await fireGtagConversion(
    {
      send_to: getGoogleAdsSignupSendTo(),
      transaction_id: userId,
    },
    {
      email: options.email,
      onSuccess: () => record("signup", userId),
    },
  );
}
