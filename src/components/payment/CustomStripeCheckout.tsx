"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  ExpressCheckoutElement,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import type { StripeCheckoutExpressCheckoutElementOptions } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { getStripeCheckoutAppearance } from "@/lib/stripe/appearance";
import {
  expressCheckoutOptions,
  paymentElementOptions,
} from "@/lib/stripe/payment-methods";
import {
  fetchStripeCheckoutClientSecret,
  type StripeCheckoutPayload,
} from "@/lib/stripe/fetch-client-secret";

export type { StripeCheckoutPayload };

function CheckoutPaymentForm({
  payLabel,
  onRetry,
}: {
  payLabel: string;
  onRetry: () => void;
}) {
  const checkoutState = useCheckoutElements();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [walletLabel, setWalletLabel] = useState("Apple Pay · Google Pay");

  if (checkoutState.type === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#94a3b8]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Preparing payment form…
      </div>
    );
  }

  if (checkoutState.type === "error") {
    return (
      <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        <p>{checkoutState.error.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-red-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-100 hover:bg-red-500/10"
        >
          Reload payment form
        </button>
      </div>
    );
  }

  const { checkout } = checkoutState;

  async function confirmPayment() {
    setSubmitting(true);
    setMessage(null);

    const confirmResult = await checkout.confirm();

    if (confirmResult.type === "error") {
      setMessage(confirmResult.error.message);
    }

    setSubmitting(false);
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void confirmPayment();
      }}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
          {walletLabel}
        </p>
        <ExpressCheckoutElement
          options={
            expressCheckoutOptions as unknown as StripeCheckoutExpressCheckoutElementOptions
          }
          onReady={(event) => {
            const methods = event.availablePaymentMethods;
            if (!methods) return;

            const labels: string[] = [];
            if (methods.googlePay) labels.push("Google Pay");
            if (methods.applePay) labels.push("Apple Pay");
            if (labels.length > 0) {
              setWalletLabel(labels.join(" · "));
            }
          }}
          onConfirm={async () => {
            await confirmPayment();
          }}
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
          Debit or credit card
        </p>
        <div className="rounded-xl border border-white/10 bg-[#0e0a18]/60 p-4 sm:p-5">
          <PaymentElement options={paymentElementOptions} />
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="lf-btn-primary inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {payLabel}
      </button>

      <p className="text-center text-xs text-[#64748b]">
        Card details are encrypted. Payments processed securely by Stripe.
      </p>
    </form>
  );
}

export default function CustomStripeCheckout({
  payload,
  payLabel,
}: {
  payload: StripeCheckoutPayload;
  payLabel: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const clientSecretCacheRef = useRef<Map<string, Promise<string>>>(new Map());

  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || null;

  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey],
  );

  const payloadKey = `${JSON.stringify(payload)}:${loadAttempt}`;

  function retryCheckout() {
    clientSecretCacheRef.current.delete(payloadKey);
    setClientSecret(null);
    setError(null);
    setLoadAttempt((attempt) => attempt + 1);
  }

  useEffect(() => {
    if (!publishableKey) {
      setError(
        "Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
      );
      return;
    }

    let cancelled = false;

    const cache = clientSecretCacheRef.current;
    let pending = cache.get(payloadKey);
    if (!pending) {
      pending = fetchStripeCheckoutClientSecret(payload);
      cache.set(payloadKey, pending);
      void pending.catch(() => {
        cache.delete(payloadKey);
      });
    }

    void pending
      .then((secret) => {
        if (!cancelled) {
          setClientSecret(secret);
          setError(null);
        }
      })
      .catch((err) => {
        if (cancelled || (err instanceof Error && err.message === "__redirect__")) {
          return;
        }
        setError(
          err instanceof Error ? err.message : "Could not load checkout.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [payloadKey, payload, publishableKey]);

  if (!publishableKey || error) {
    return (
      <div className="mt-6 space-y-3">
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error ||
            "Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY."}
        </p>
        {error ? (
          <button
            type="button"
            onClick={retryCheckout}
            className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#94a3b8] hover:bg-white/5"
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/10 py-10 text-sm text-[#94a3b8]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading payment form…
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <CheckoutElementsProvider
        key={clientSecret}
        stripe={stripePromise}
        options={{
          clientSecret,
          defaultValues: {
            billingAddress: {
              address: { country: "GB" },
            },
          },
          elementsOptions: {
            appearance: getStripeCheckoutAppearance(),
          },
        }}
      >
        <CheckoutPaymentForm payLabel={payLabel} onRetry={retryCheckout} />
      </CheckoutElementsProvider>
    </div>
  );
}
