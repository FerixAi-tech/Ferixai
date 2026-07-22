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
    ) => void;
    _fbq?: Window["fbq"];
  }
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  const fire = () => {
    if (typeof window.fbq !== "function") return false;
    if (params) {
      window.fbq("track", event, params);
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
  trackMetaEvent("CompleteRegistration");
}

export function trackPurchase(options: {
  value: number;
  currency: string;
}): void {
  trackMetaEvent("Purchase", {
    value: options.value,
    currency: options.currency,
  });
}
