"use client";

import { useEffect, useRef } from "react";
import { trackGoogleAdsPurchase } from "@/lib/google-ads/conversion";

/**
 * Fires Google Ads Purchase only after the dashboard has verified a paid order
 * in the database (not from URL params alone).
 */
export default function GoogleAdsPaymentSuccessTracker({
  active,
  value,
  currency = "AED",
  transactionId,
  email,
}: {
  active: boolean;
  /** Charged amount from payment_orders (Stripe-backed). */
  value: number;
  currency?: string;
  /** Stripe PaymentIntent id preferred; session id or order id as fallback. */
  transactionId?: string;
  email?: string;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    if (!transactionId?.trim()) return;
    if (!(value > 0)) return;
    if (firedRef.current) return;

    firedRef.current = true;
    trackGoogleAdsPurchase({
      value,
      currency,
      transactionId,
      email,
    });
  }, [active, value, currency, transactionId, email]);

  return null;
}
