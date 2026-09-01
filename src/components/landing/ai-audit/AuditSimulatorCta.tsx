"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import BillingCycleToggle from "@/components/pricing/BillingCycleToggle";
import { formatLandingCurrency } from "@/lib/constants/landing-locale";
import {
  getPlanListPrice,
  listPricingPlans,
  type BillingCycle,
} from "@/lib/constants/pricing-plans";

export default function AuditSimulatorCta({
  billingCycle,
  onBillingCycleChange,
  onCheckout,
}: {
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  onCheckout: () => void;
}) {
  const starter = listPricingPlans()[0]!;
  const monthlyPrice = getPlanListPrice(starter, "monthly");
  const yearlyPrice = getPlanListPrice(starter, "yearly");
  const activePrice = getPlanListPrice(starter, billingCycle);

  return (
    <div className="mt-8 rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-500/10 via-[#0a0d14] to-emerald-500/10 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-300" />
        <div>
          <h3 className="lf-orbitron text-xl font-bold text-white sm:text-2xl">
            Don&apos;t Let Rivals Take Your AI Search Traffic.
          </h3>
          <p className="mt-2 text-base leading-relaxed text-[#94a3b8] sm:text-lg">
            Turn this preview into live reality across ChatGPT, Claude, and
            Gemini in 48 hours.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BillingCycleToggle
          value={billingCycle}
          onChange={onBillingCycleChange}
          formatAmount={formatLandingCurrency}
        />
        {billingCycle === "yearly" ? (
          <span className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-200">
            20% OFF + 2 Months Free
          </span>
        ) : null}
      </div>

      <p className="lf-orbitron mt-4 text-2xl font-bold text-white">
        {formatLandingCurrency(activePrice)}
        <span className="ml-2 text-sm font-normal text-[#94a3b8]">
          /{billingCycle === "yearly" ? "year" : "month"}
        </span>
      </p>
      <p className="mt-1 text-xs text-[#64748b]">
        {billingCycle === "monthly"
          ? `Or ${formatLandingCurrency(yearlyPrice)}/year with annual billing.`
          : `Compared to ${formatLandingCurrency(monthlyPrice)}/month billed monthly.`}
      </p>
      <p className="mt-3 text-xs italic leading-relaxed text-[#64748b]">
        Monthly plans require ongoing indexing. Annual plan guarantees 365-day
        uninterrupted entity retention.
      </p>

      <button
        type="button"
        onClick={onCheckout}
        className="lf-btn-primary mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white sm:text-base"
      >
        Lock My AI Ranking Now (14-Day Money-Back Guarantee)
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
