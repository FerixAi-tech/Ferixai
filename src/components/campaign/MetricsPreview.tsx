"use client";

import {
  applyPromoDiscount,
  BILLING_CYCLE_DAYS,
  getPricingPlan,
  PROMO_DISCOUNT_GBP,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import {
  formatCurrency,
  getCampaignContentPlanForPlan,
} from "@/lib/constants/metrics";
import { Calendar, Eye, Search, TrendingUp } from "lucide-react";

interface MetricsPreviewProps {
  planSlug: PricingPlanSlug;
  promoApplied?: boolean;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

function getOutcomeMetrics(intensityScore: number, listPrice: number) {
  const estimatedReach = Math.max(
    1_200,
    Math.round(listPrice * 90 + intensityScore * 2200),
  );
  const visibilityBoost = Math.min(
    480,
    Math.max(120, Math.round(110 + intensityScore * 55)),
  );
  const keywordCount = Math.max(10, Math.round(10 + intensityScore * 8));

  return { estimatedReach, visibilityBoost, keywordCount };
}

export default function MetricsPreview({
  planSlug,
  promoApplied = false,
}: MetricsPreviewProps) {
  const pricing = getPricingPlan(planSlug);
  const { listPrice, payable } = applyPromoDiscount(
    pricing.priceMonthlyGbp,
    promoApplied ? PROMO_DISCOUNT_GBP : 0,
  );
  const contentPlan = getCampaignContentPlanForPlan(pricing, payable);
  const outcomes = getOutcomeMetrics(pricing.intensityScore, listPrice);

  const items = [
    {
      icon: Eye,
      heading: "Estimated AI Reach",
      highlight: `Est. ${formatCompactNumber(outcomes.estimatedReach)}+`,
      description:
        "targeted local views. The volume of monthly local AI assistant searches we index your business for under this plan.",
    },
    {
      icon: TrendingUp,
      heading: "AI Visibility Boost",
      highlight: `Up to +${outcomes.visibilityBoost}%`,
      description:
        "faster indexing. Higher plans signal our system to inject deeper semantic structured data into ChatGPT and Gemini pipelines.",
    },
    {
      icon: Search,
      heading: "AI Discovery Keywords",
      highlight: `${outcomes.keywordCount}+`,
      description:
        "High-intent search phrases optimized (e.g., 'best clinic near me', 'top-rated cafe'). Higher plans unlock more local long-tail keywords.",
    },
    {
      icon: Calendar,
      heading: "Billing cycle",
      highlight: `${BILLING_CYCLE_DAYS}-day month`,
      description:
        "Your optimized business matrix is actively pushed and validated across modern answer engines for the full monthly cycle.",
    },
  ];

  return (
    <div className="space-y-6">
      <div
        className={`rounded-[18px] border p-6 ${
          promoApplied
            ? "border-emerald-400/35 bg-[linear-gradient(165deg,rgba(16,185,129,0.14),#0e0a18_55%,#090610)] shadow-[0_0_28px_rgba(16,185,129,0.18)]"
            : "border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)]"
        }`}
      >
        <p className="text-sm text-[#94a3b8]">{pricing.name}</p>
        {promoApplied ? (
          <>
            <p className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="text-lg text-[#64748b] line-through">
                {formatCurrency(listPrice)}
              </span>
              <span className="lf-orbitron text-3xl font-bold text-emerald-300">
                {formatCurrency(payable)}
              </span>
            </p>
            <p className="mt-1 text-sm text-[#64748b]">
              first month · then {formatCurrency(listPrice)}/month
            </p>
            <p className="mt-3 text-xs font-semibold leading-relaxed text-emerald-200/90">
              £30 promo applied — strike-through shows list price vs first-month
              total.
            </p>
          </>
        ) : (
          <>
            <p className="lf-orbitron mt-1 text-3xl font-bold text-white">
              {formatCurrency(listPrice)}
              <span className="ml-1 text-base font-semibold text-[#94a3b8]">
                /month
              </span>
            </p>
            <p className="mt-1 text-sm text-[#64748b]">
              {contentPlan.aggressiveness} intensity ·{" "}
              {contentPlan.estimatedContentPieces} content pieces
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#94a3b8]">
              Apply your FX30 code for £30 off the first month.
            </p>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.heading}
            className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <item.icon className="h-4 w-4 text-emerald-300" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                {item.heading}
              </span>
            </div>
            <p className="lf-orbitron text-lg font-bold text-white sm:text-xl">
              {item.highlight}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#94a3b8]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-center text-sm text-emerald-100/90">
          These estimates update as you switch plans — so you can see what your
          business acquires before you launch.
        </p>
      </div>
    </div>
  );
}
