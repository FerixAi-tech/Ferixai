export const META_PIXEL_ID = "1440528267880217";

export type MetaPixelCommand =
  | "init"
  | "track"
  | "trackCustom"
  | "consent";

declare global {
  interface Window {
    fbq?: (
      command: MetaPixelCommand,
      eventOrId: string,
      params?: Record<string, unknown>,
      eventData?: { eventID?: string },
    ) => void;
    _fbq?: Window["fbq"];
  }
}

function rememberEvent(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem(key) === "1") return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string; dedupeKey?: string },
): void {
  if (typeof window === "undefined") return;

  if (options?.dedupeKey && !rememberEvent(options.dedupeKey)) {
    return;
  }

  const eventData = options?.eventID
    ? { eventID: options.eventID }
    : undefined;

  const fire = () => {
    if (typeof window.fbq !== "function") return false;
    if (params && eventData) {
      window.fbq("track", event, params, eventData);
    } else if (params) {
      window.fbq("track", event, params);
    } else if (eventData) {
      window.fbq("track", event, {}, eventData);
    } else {
      window.fbq("track", event);
    }
    return true;
  };

  if (fire()) return;

  // Pixel script may still be loading afterInteractive
  let attempts = 0;
  const id = window.setInterval(() => {
    attempts += 1;
    if (fire() || attempts >= 25) {
      window.clearInterval(id);
    }
  }, 100);
}

export function trackCompleteRegistration(): void {
  trackMetaEvent("CompleteRegistration", undefined, {
    dedupeKey: "ferixai_meta_complete_registration",
  });
}

export function trackInitiateCheckout(options?: {
  value?: number;
  currency?: string;
  content_name?: string;
  /** Stable id for this checkout attempt (e.g. plan + timestamp bucket). */
  dedupeKey?: string;
}): void {
  const params: Record<string, unknown> = {};
  if (options?.value != null) params.value = options.value;
  if (options?.currency) params.currency = options.currency;
  if (options?.content_name) params.content_name = options.content_name;

  const dedupeKey =
    options?.dedupeKey ||
    `ferixai_meta_initiate_checkout:${options?.content_name || "plan"}:${options?.value ?? ""}:${options?.currency || ""}`;

  trackMetaEvent(
    "InitiateCheckout",
    Object.keys(params).length > 0 ? params : undefined,
    { dedupeKey, eventID: dedupeKey },
  );
}

export function trackPurchase(options: {
  value: number;
  currency: string;
  dedupeKey?: string;
}): void {
  const dedupeKey =
    options.dedupeKey ||
    `ferixai_meta_purchase:${options.value}:${options.currency}`;
  trackMetaEvent(
    "Purchase",
    {
      value: options.value,
      currency: options.currency,
    },
    { dedupeKey, eventID: dedupeKey },
  );
}
