"use client";

import { useEffect } from "react";
import { getIyzicoCheckoutCharge } from "@/lib/constants/checkout";
import { trackPurchase } from "@/lib/meta/pixel";

const STORAGE_KEY = "ferixai_meta_purchase_fired";

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

    const key = `${STORAGE_KEY}:${dedupeKey || "payment-ok"}`;
    try {
      if (window.sessionStorage.getItem(key) === "1") return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage may be blocked; still attempt one fire this mount
    }

    const charge = getIyzicoCheckoutCharge(payableGbp);
    trackPurchase({
      value: charge.amount,
      currency: charge.currency,
    });
  }, [active, dedupeKey, payableGbp]);

  return null;
}
