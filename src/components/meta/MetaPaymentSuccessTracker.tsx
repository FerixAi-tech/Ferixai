"use client";

import { useEffect } from "react";
import { getIyzicoCheckoutCharge } from "@/lib/constants/checkout";
import { trackPurchase } from "@/lib/meta/pixel";

/**
 * Fires Meta Purchase once when iyzico callback lands with payment=ok.
 */
export default function MetaPaymentSuccessTracker({
  active,
  dedupeKey,
  /** Plan payable in GBP (list/promo); overridden to ₺1 while TRY test mode is on. */
  payableGbp = 0,
}: {
  active: boolean;
  dedupeKey?: string;
  payableGbp?: number;
}) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const charge = getIyzicoCheckoutCharge(payableGbp);
    trackPurchase({
      value: charge.amount,
      currency: charge.currency,
      dedupeKey: `ferixai_meta_purchase:${dedupeKey || "payment-ok"}`,
    });
  }, [active, dedupeKey, payableGbp]);

  return null;
}
