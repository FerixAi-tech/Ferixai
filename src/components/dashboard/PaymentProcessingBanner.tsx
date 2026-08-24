"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Shown while Stripe confirmed payment but campaign fulfillment is still running.
 * Polls for a paid order with campaign_slug, then redirects to the real success URL.
 */
export default function PaymentProcessingBanner() {
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let attempts = 0;

    async function checkReady() {
      if (cancelled) return;
      attempts += 1;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const since = new Date(Date.now() - 20 * 60 * 1000).toISOString();
        const { data: order } = await supabase
          .from("payment_orders")
          .select("campaign_slug, status, updated_at")
          .eq("user_id", user.id)
          .eq("status", "paid")
          .not("campaign_slug", "is", null)
          .gte("updated_at", since)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const slug = String(order?.campaign_slug || "").trim();
        if (slug) {
          window.location.replace(
            `/dashboard?created=${encodeURIComponent(slug)}&payment=ok`,
          );
          return;
        }
      }

      if (attempts < 30 && !cancelled) {
        window.setTimeout(() => {
          void checkReady();
        }, 2000);
      }
    }

    void checkReady();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="lf-animate-in mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15">
          <Loader2 className="h-5 w-5 animate-spin text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            Confirming payment
          </p>
          <h2 className="lf-orbitron mt-2 text-lg font-bold text-white sm:text-xl">
            Your payment is being confirmed
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-100/90">
            We&apos;ve received confirmation from the payment provider and are
            starting your campaign. This page will update automatically — please
            stay here for a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
