"use client";

import type { PricingPlanSlug } from "@/lib/constants/pricing-plans";

export type StripeCheckoutPayload = {
  businessName: string;
  category: string;
  city: string;
  planSlug: PricingPlanSlug;
  promoApplied: false;
  productDescription?: string;
  keyFeatures: string[];
};

function readBrowserCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export async function fetchStripeCheckoutClientSecret(
  payload: StripeCheckoutPayload,
): Promise<string> {
  const res = await fetch("/api/payments/stripe/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      fbp: readBrowserCookie("_fbp"),
      fbc: readBrowserCookie("_fbc"),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    clientSecret?: string;
    requiresPayment?: boolean;
    slug?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || `Checkout failed (${res.status})`);
  }

  if (!data.requiresPayment && data.slug) {
    window.location.assign(
      `/dashboard?created=${encodeURIComponent(data.slug)}`,
    );
    throw new Error("__redirect__");
  }

  const clientSecret = data.clientSecret?.trim();
  if (!clientSecret) {
    throw new Error(data.error || "Could not start checkout.");
  }

  return clientSecret;
}
