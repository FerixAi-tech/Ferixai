import posthog from "posthog-js";

let initialized = false;

export function initPostHog(): typeof posthog | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return null;

  if (!initialized) {
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
        "https://eu.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      session_recording: {},
    });
    initialized = true;
  }

  return posthog;
}

export function getPostHog(): typeof posthog | null {
  if (typeof window === "undefined") return null;
  return initialized ? posthog : initPostHog();
}

export function captureCheckoutInitiated(
  plan: string,
  properties?: Record<string, unknown>,
): void {
  const client = getPostHog();
  if (!client) return;

  client.capture("checkout_initiated", {
    plan,
    ...properties,
  });
}
