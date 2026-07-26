"use client";

import { useEffect } from "react";
import { getIyzicoCheckoutCharge } from "@/lib/constants/checkout";
import { trackPurchase } from "@/lib/meta/pixel";

/**
 * Fires Meta Purchase only for a verified paid campaign (positive charged amount).
 */
export default function MetaPaymentSuccessTracker({
  active,
  dedupeKey,
  /** Actual charged amount (from payment_orders / campaign total). */
  payableGbp = 0,
}: {
  active: boolean;
  /** Must be a stable paid-order key (e.g. campaign slug + order id). */
  dedupeKey?: string;
  payableGbp?: number;
}) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    if (!dedupeKey) return;
    if (!(payableGbp > 0)) return;

    const charge = getIyzicoCheckoutCharge(payableGbp);
    if (!(charge.amount > 0)) return;

    trackPurchase({
      value: charge.amount,
      currency: charge.currency,
      dedupeKey: `ferixai_meta_purchase:${dedupeKey}`,
    });
  }, [active, dedupeKey, payableGbp]);

  return null;
}
