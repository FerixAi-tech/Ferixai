"use client";

import {
  Component,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  ExpressCheckoutElement,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { getStripeCheckoutAppearance } from "@/lib/stripe/appearance";
import {
  getExpressCheckoutOptions,
  getExpressSectionLabel,
  getPaymentElementOptions,
  getPaymentSectionLabel,
} from "@/lib/stripe/payment-methods";
import {
  fetchStripeCheckoutClientSecret,
  type StripeCheckoutPayload,
} from "@/lib/stripe/fetch-client-secret";
import { CHECKOUT_CURRENCY } from "@/lib/constants/checkout";

export type { StripeCheckoutPayload };

const CHECKOUT_STORAGE_KEY = "ferix_stripe_checkout_v3_en";
const CHECKOUT_STORAGE_TTL_MS = 30 * 60 * 1000;

function checkoutStoragePayloadKey(payloadKey: string): string {
  return `${payloadKey}:${CHECKOUT_CURRENCY}`;
}

function getUserAgent(): string {
  return typeof window !== "undefined" ? window.navigator.userAgent : "";
}

function readStoredClientSecret(payloadKey: string): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      key?: string;
      secret?: string;
      savedAt?: number;
      currency?: string;
    };
    const storageKey = checkoutStoragePayloadKey(payloadKey);
    if (
      parsed.key !== storageKey ||
      typeof parsed.secret !== "string" ||
      !parsed.secret.trim()
    ) {
      return null;
    }
    if (parsed.currency && parsed.currency !== CHECKOUT_CURRENCY) {
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return null;
    }
    if (
      typeof parsed.savedAt === "number" &&
      Date.now() - parsed.savedAt > CHECKOUT_STORAGE_TTL_MS
    ) {
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return null;
    }
    return parsed.secret.trim();
  } catch {
    return null;
  }
}

function writeStoredClientSecret(payloadKey: string, secret: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify({
        key: checkoutStoragePayloadKey(payloadKey),
        secret,
        currency: CHECKOUT_CURRENCY,
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Ignore quota / private mode errors.
  }
}

function clearStoredClientSecret(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

class ExpressCheckoutBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onFailure();
  }

  render(): ReactNode {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function CheckoutPaymentForm({
  payLabel,
  onRetry,
  invoiceSection,
}: {
  payLabel: string;
  onRetry: () => void;
  invoiceSection?: ReactNode;
}) {
  const checkoutState = useCheckoutElements();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [walletLabel, setWalletLabel] = useState(() =>
    getExpressSectionLabel(getUserAgent()),
  );
  const [expressEnabled, setExpressEnabled] = useState(true);

  const userAgent = useMemo(() => getUserAgent(), []);
  const paymentOptions = useMemo(
    () => getPaymentElementOptions(userAgent),
    [userAgent],
  );
  const paymentSectionLabel = useMemo(
    () => getPaymentSectionLabel(userAgent),
    [userAgent],
  );
  const expressOptions = useMemo(
    () => getExpressCheckoutOptions(userAgent),
    [userAgent],
  );

  useEffect(() => {
    setWalletLabel(getExpressSectionLabel(userAgent));
  }, [userAgent]);

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

  async function confirmCardPayment() {
    setSubmitting(true);
    setMessage(null);

    const confirmResult = await checkout.confirm();

    if (confirmResult.type === "error") {
      setMessage(confirmResult.error.message);
    }

    setSubmitting(false);
  }

  function handleExpressConfirm(event: StripeExpressCheckoutElementConfirmEvent) {
    setSubmitting(true);
    setMessage(null);

    void checkout
      .confirm({ expressCheckoutConfirmEvent: event })
      .then((confirmResult) => {
        if (confirmResult.type === "error") {
          setMessage(confirmResult.error.message);
        }
        setSubmitting(false);
      });
  }

  return (
    <div className="space-y-5">
      {expressEnabled ? (
        <ExpressCheckoutBoundary onFailure={() => setExpressEnabled(false)}>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
              {walletLabel}
            </p>
            <div className="min-h-[48px]">
              <ExpressCheckoutElement
                options={expressOptions}
                onReady={(event) => {
                  const methods = event.availablePaymentMethods;
                  if (!methods) return;

                  const labels: string[] = [];
                  if (methods.applePay) labels.push("Apple Pay");
                  if (methods.googlePay) labels.push("Google Pay");
                  if (labels.length > 0) {
                    setWalletLabel(labels.join(" · "));
                  }
                }}
                onLoadError={() => setExpressEnabled(false)}
                onConfirm={handleExpressConfirm}
              />
            </div>
          </div>
        </ExpressCheckoutBoundary>
      ) : null}

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void confirmCardPayment();
        }}
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748b]">
            {paymentSectionLabel}
          </p>
          <div className="rounded-xl border border-white/10 bg-[#0e0a18]/60 p-4 sm:p-5">
            <PaymentElement options={paymentOptions} />
          </div>
        </div>

        {message ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {message}
          </p>
        ) : null}

        {invoiceSection}

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
    </div>
  );
}

export default function CustomStripeCheckout({
  payload,
  payLabel,
  invoiceSection,
}: {
  payload: StripeCheckoutPayload;
  payLabel: string;
  invoiceSection?: ReactNode;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const clientSecretCacheRef = useRef<Map<string, Promise<string>>>(new Map());

  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || null;

  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey, { locale: "en" }) : null),
    [publishableKey],
  );

  const payloadFingerprint = useMemo(() => JSON.stringify(payload), [payload]);
  const payloadKey = `${payloadFingerprint}:${loadAttempt}`;

  const appearance = useMemo(() => getStripeCheckoutAppearance(), []);

  const elementsProviderOptions = useMemo(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      defaultValues: {
        billingAddress: {
          address: { country: "AE" as const },
        },
      },
      elementsOptions: {
        appearance,
      },
    };
  }, [appearance, clientSecret]);

  function retryCheckout() {
    clientSecretCacheRef.current.delete(payloadKey);
    clearStoredClientSecret();
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

    const storedSecret = readStoredClientSecret(payloadFingerprint);
    if (storedSecret) {
      setClientSecret(storedSecret);
      setError(null);
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
          writeStoredClientSecret(payloadFingerprint, secret);
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
  }, [payloadFingerprint, payloadKey, publishableKey]);

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

  if (!clientSecret || !stripePromise || !elementsProviderOptions) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/10 py-10 text-sm text-[#94a3b8]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading payment form…
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-5" lang="en">
      <CheckoutElementsProvider
        key={clientSecret}
        stripe={stripePromise}
        options={elementsProviderOptions}
      >
        <CheckoutPaymentForm
          payLabel={payLabel}
          onRetry={retryCheckout}
          invoiceSection={invoiceSection}
        />
      </CheckoutElementsProvider>
      <p className="mt-3 text-center text-xs text-[#64748b]">
        If payment options fail to load, wait 10 minutes before refreshing — too
        many reloads can temporarily block Stripe security checks.
      </p>
    </div>
  );
}
