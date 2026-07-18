"use client";

import {
  BUDGET_MAX,
  BUDGET_MIN,
  DAYS_MAX,
  DAYS_MIN,
  formatCurrency,
  getCampaignContentPlan,
} from "@/lib/constants/metrics";
import { Calendar, Eye, Search, TrendingUp } from "lucide-react";

interface MetricsPreviewProps {
  dailyBudget: number;
  days: number;
  promoApplied?: boolean;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

/** Outcome-focused planning estimates that scale with budget × days. */
function getOutcomeMetrics(dailyBudget: number, days: number) {
  const estimatedReach = Math.max(
    1_200,
    Math.round((dailyBudget * days * 5000) / 30),
  );
  const visibilityBoost = Math.min(
    480,
    Math.max(120, Math.round(100 + dailyBudget * 5 + days * 2)),
  );
  const keywordCount = Math.max(
    10,
    Math.round(8 + dailyBudget / 5 + days * 0.5),
  );

  return { estimatedReach, visibilityBoost, keywordCount };
}

export default function MetricsPreview({
  dailyBudget,
  days,
  promoApplied = false,
}: MetricsPreviewProps) {
  const plan = getCampaignContentPlan(dailyBudget, days);
  const outcomes = getOutcomeMetrics(dailyBudget, days);

  const items = [
    {
      icon: Eye,
      heading: "Estimated AI Reach",
      highlight: `Est. ${formatCompactNumber(outcomes.estimatedReach)}+`,
      description:
        "targeted local views. The volume of monthly local AI assistant searches we index your business for under this budget.",
    },
    {
      icon: TrendingUp,
      heading: "AI Visibility Boost",
      highlight: `Up to +${outcomes.visibilityBoost}%`,
      description:
        "faster indexing. Higher budget signals our system to inject deeper semantic structured data into ChatGPT and Gemini pipelines.",
    },
    {
      icon: Search,
      heading: "AI Discovery Keywords",
      highlight: `${outcomes.keywordCount}+`,
      description:
        "High-intent search phrases optimized (e.g., 'best clinic near me', 'top-rated cafe'). More budget unlocks hyper-targeted local long-tail keywords.",
    },
    {
      icon: Calendar,
      heading: "Campaign Length",
      highlight: promoApplied
        ? `${days} Days (Free Promo Active)`
        : `${days} Day${days === 1 ? "" : "s"}`,
      description: promoApplied
        ? "Your optimized business matrix is actively pushed and validated across modern answer engines for the full free promo window."
        : `Your optimized business matrix is actively pushed and validated across modern answer engines for ${days} full day${days === 1 ? "" : "s"}.`,
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
        <p className="text-sm text-[#94a3b8]">Plan total (not charged)</p>
        <p
          className={`lf-orbitron mt-1 text-3xl font-bold ${
            promoApplied ? "text-emerald-300" : "text-white"
          }`}
        >
          {promoApplied ? "£0" : formatCurrency(plan.totalCost)}
        </p>
        <p className="mt-1 text-sm text-[#64748b]">
          {formatCurrency(dailyBudget)} × {days} days
        </p>
        {promoApplied ? (
          <p className="mt-3 text-xs font-semibold leading-relaxed text-emerald-200/90">
            ✨ Promo applied — 3-day free campaign (£30 value) at £0 payable.
          </p>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-[#94a3b8]">
            Shown for planning clarity. Apply your FX30 code to unlock £0.
          </p>
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
          These estimates update live as you change budget or days — so you can
          see what your business acquires before you launch.
        </p>
      </div>
    </div>
  );
}

export function BudgetSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-[#94a3b8]">
          Daily plan intensity
        </label>
        <span className="lf-orbitron text-lg font-bold text-emerald-300">
          {formatCurrency(value)}
        </span>
      </div>
      <input
        type="range"
        min={BUDGET_MIN}
        max={BUDGET_MAX}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-500"
      />
      <div className="mt-1 flex justify-between text-xs text-[#64748b]">
        <span>{formatCurrency(BUDGET_MIN)}</span>
        <span>{formatCurrency(BUDGET_MAX)}</span>
      </div>
    </div>
  );
}

export function DaysSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-[#94a3b8]">
          Campaign length
        </label>
        <span className="lf-orbitron text-lg font-bold text-fuchsia-300">
          {value} days
        </span>
      </div>
      <input
        type="range"
        min={DAYS_MIN}
        max={DAYS_MAX}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-fuchsia-500"
      />
      <div className="mt-1 flex justify-between text-xs text-[#64748b]">
        <span>{DAYS_MIN} days</span>
        <span>{DAYS_MAX} days</span>
      </div>
    </div>
  );
}
