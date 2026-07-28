"use client";

import { useEffect } from "react";
import { getIyzicoCheckoutCharge } from "@/lib/constants/checkout";
import { trackPurchase } from "@/lib/meta/pixel";

/**
 * Fires Meta Purchase only for a verified paid campaign (positive charged amount).
 * `eventID` must match the server CAPI Purchase `event_id` (payment order id).
 */
export default function MetaPaymentSuccessTracker({
  active,
  dedupeKey,
  eventID,
  /** Actual charged amount (from payment_orders / campaign total). */
  payableGbp = 0,
}: {
  active: boolean;
  /** Must be a stable paid-order key (e.g. campaign slug + order id). */
  dedupeKey?: string;
  /** Same id sent to Meta CAPI for deduplication. */
  eventID?: string;
  payableGbp?: number;
}) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    if (!dedupeKey || !eventID) return;
    if (!(payableGbp > 0)) return;

    const charge = getIyzicoCheckoutCharge(payableGbp);
    if (!(charge.amount > 0)) return;

    trackPurchase({
      value: charge.amount,
      currency: charge.currency,
      content_name: "FerixAI Subscription",
      dedupeKey: `ferixai_meta_purchase:${dedupeKey}`,
      eventID,
    });
  }, [active, dedupeKey, eventID, payableGbp]);

  return null;
}
