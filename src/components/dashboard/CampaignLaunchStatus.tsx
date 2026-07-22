"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Phase = "featuring" | "ready";

/**
 * Post-payment banner: reassuring copy while deferred content publishes,
 * then auto-updates when the article is live (no manual refresh).
 */
export default function CampaignLaunchStatus({
  businessName,
  slug,
  paymentOk,
  initiallyReady,
}: {
  businessName: string;
  slug: string;
  paymentOk: boolean;
  initiallyReady: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [phase, setPhase] = useState<Phase>(
    initiallyReady ? "ready" : "featuring",
  );

  useEffect(() => {
    if (phase === "ready") return;

    let cancelled = false;
    let attempts = 0;

    async function checkReady() {
      attempts += 1;
      const { data } = await supabase
        .from("published_contents")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;

      if (data?.slug) {
        setPhase("ready");
        router.refresh();
        return;
      }

      // Keep polling for ~3 minutes while OpenAI / channels finish
      if (attempts < 60) {
        window.setTimeout(checkReady, 3000);
      }
    }

    void checkReady();
    return () => {
      cancelled = true;
    };
  }, [phase, slug, supabase, router]);

  if (phase === "featuring") {
    return (
      <div className="lf-animate-in lf-animate-in-1 mb-8 overflow-hidden rounded-xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-violet-500/10 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              {paymentOk ? "Payment confirmed" : "Campaign launched"}
            </p>
            <h2 className="lf-orbitron mt-2 text-lg font-bold text-white sm:text-xl">
              Your business is being featured🚀
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
              We&apos;re preparing and publishing local AI visibility content
              for{" "}
              <span className="font-semibold text-white">{businessName}</span>.
              This usually takes under a minute — stay on this page and we&apos;ll
              update automatically when it&apos;s live.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              Optimising your presence for AI assistants
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lf-animate-in lf-animate-in-1 mb-8 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            You&apos;re live
          </p>
          <h2 className="lf-orbitron mt-2 text-lg font-bold text-white sm:text-xl">
            {businessName} is now being featured
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
            Your campaign content is published. AI assistants can start
            discovering your business from the material we prepared.
          </p>
          <Link
            href={`/content/${slug}`}
            className="mt-4 inline-flex text-sm font-semibold text-teal-300 hover:underline"
          >
            View your published article →
          </Link>
        </div>
      </div>
    </div>
  );
}
