"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadStripe,
  type StripeEmbeddedCheckout,
  type StripeEmbeddedCheckoutOptions,
} from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import type { PricingPlanSlug } from "@/lib/constants/pricing-plans";

export type EmbeddedCheckoutPayload = {
  businessName: string;
  category: string;
  city: string;
  planSlug: PricingPlanSlug;
  promoApplied: false;
  productDescription?: string;
  keyFeatures: string[];
};

type StripeEmbeddedCapable = {
  initEmbeddedCheckout?(
    options: StripeEmbeddedCheckoutOptions,
  ): Promise<StripeEmbeddedCheckout>;
  createEmbeddedCheckoutPage?(
    options: StripeEmbeddedCheckoutOptions,
  ): Promise<StripeEmbeddedCheckout>;
};

function readBrowserCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

async function createEmbeddedCheckout(
  stripe: StripeEmbeddedCapable,
  options: StripeEmbeddedCheckoutOptions,
): Promise<StripeEmbeddedCheckout> {
  if (stripe.createEmbeddedCheckoutPage) {
    return stripe.createEmbeddedCheckoutPage(options);
  }
  if (stripe.initEmbeddedCheckout) {
    return stripe.initEmbeddedCheckout(options);
  }
  throw new Error("Embedded Checkout is not available in this Stripe.js build.");
}

async function fetchCheckoutClientSecret(
  payload: EmbeddedCheckoutPayload,
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

  if (!data.clientSecret) {
    throw new Error(data.error || "Could not start embedded checkout.");
  }

  return data.clientSecret;
}

export default function EmbeddedStripeCheckout({
  payload,
}: {
  payload: EmbeddedCheckoutPayload;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<StripeEmbeddedCheckout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const payloadKey = JSON.stringify(payload);

  useEffect(() => {
    const publishableKey =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
    if (!publishableKey) {
      setError(
        "Stripe is not configured for embedded checkout. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
      );
      setLoading(false);
      return;
    }

    const stripePublishableKey = publishableKey;
    let cancelled = false;

    async function mountCheckout() {
      setLoading(true);
      setError(null);

      try {
        const stripe = await loadStripe(stripePublishableKey);
        if (!stripe || cancelled) return;

        checkoutRef.current?.destroy();
        checkoutRef.current = null;

        const checkout = await createEmbeddedCheckout(
          stripe as StripeEmbeddedCapable,
          {
            fetchClientSecret: () => fetchCheckoutClientSecret(payload),
          },
        );

        if (cancelled) {
          checkout.destroy();
          return;
        }

        checkoutRef.current = checkout;

        if (containerRef.current) {
          checkout.mount(containerRef.current);
        }

        setLoading(false);
      } catch (err) {
        if (cancelled || (err instanceof Error && err.message === "__redirect__")) {
          return;
        }
        setError(
          err instanceof Error ? err.message : "Could not load checkout.",
        );
        setLoading(false);
      }
    }

    void mountCheckout();

    return () => {
      cancelled = true;
      try {
        checkoutRef.current?.destroy();
      } catch {
        // Stripe throws if destroy is called twice on the same instance.
      }
      checkoutRef.current = null;
    };
  }, [payloadKey]);

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#94a3b8]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading secure checkout…
        </div>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <div
        ref={containerRef}
        className={loading || error ? "hidden" : "min-h-[420px] w-full"}
      />
    </div>
  );
}
