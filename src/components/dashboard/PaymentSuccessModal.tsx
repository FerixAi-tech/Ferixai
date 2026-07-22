"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COUNTDOWN_SECONDS = 5;

/**
 * Full-screen gate after iyzico success: gives content ~5s to publish,
 * then unlocks a single Continue button into the dashboard (no manual refresh).
 */
export default function PaymentSuccessModal({
  businessName,
  slug,
}: {
  businessName?: string;
  slug?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [contentReady, setContentReady] = useState(!slug);
  const [continuing, setContinuing] = useState(false);

  const unlocked = secondsLeft <= 0;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  // Warm content in the background during the countdown
  useEffect(() => {
    if (!slug || contentReady) return;

    let cancelled = false;

    async function poll() {
      const { data } = await supabase
        .from("published_contents")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;
      if (data?.slug) {
        setContentReady(true);
        return;
      }
      window.setTimeout(poll, 1500);
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [slug, contentReady, supabase]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function continueToDashboard() {
    if (!unlocked || continuing) return;
    setContinuing(true);
    const next = slug
      ? `/dashboard?created=${encodeURIComponent(slug)}`
      : "/dashboard";
    router.replace(next);
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-success-title"
    >
      <div className="lf-animate-in w-full max-w-md overflow-hidden rounded-[20px] border border-emerald-400/35 bg-gradient-to-b from-[#121821] to-[#0a0f16] p-[1px] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="rounded-[19px] bg-[#0b1118]/95 p-6 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15">
            <CheckCircle2 className="h-7 w-7 text-emerald-300" />
          </div>

          <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            Payment successful
          </p>
          <h2
            id="payment-success-title"
            className="lf-orbitron mt-2 text-center text-2xl font-bold tracking-tight text-white"
          >
            Your business is being featured🚀
          </h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-[#94a3b8]">
            {businessName ? (
              <>
                Thanks — we&apos;re publishing AI visibility content for{" "}
                <span className="font-semibold text-white">{businessName}</span>
                . Please wait a few seconds, then continue to your dashboard.
              </>
            ) : (
              <>
                Thanks — your payment went through. Please wait a few seconds,
                then continue to your dashboard.
              </>
            )}
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-200/85">
            {contentReady ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Content ready
              </>
            ) : (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Preparing your content…
              </>
            )}
          </div>

          <button
            type="button"
            onClick={continueToDashboard}
            disabled={!unlocked || continuing}
            className="lf-btn-primary mt-8 flex w-full min-h-[52px] items-center justify-center rounded-xl px-6 py-3.5 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            {continuing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening dashboard…
              </span>
            ) : unlocked ? (
              "Continue to Dashboard"
            ) : (
              `Continue to Dashboard (${secondsLeft})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
