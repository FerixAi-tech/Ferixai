"use client";

import BillingCycleToggle from "@/components/pricing/BillingCycleToggle";
import PlanPriceDisplay from "@/components/pricing/PlanPriceDisplay";
import {
  getBillingPeriodLabel,
  getPlanCompareAtPrice,
  getPlanListPrice,
  listPricingPlans,
  type BillingCycle,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import PaymentMethodLogos from "@/components/payment/PaymentMethodLogos";
import { Check } from "lucide-react";

export default function PricingPlanCards({
  selectedSlug,
  billingCycle,
  onBillingCycleChange,
  onSelect,
}: {
  selectedSlug: PricingPlanSlug;
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  onSelect: (slug: PricingPlanSlug) => void;
}) {
  const plans = listPricingPlans();
  const periodLabel = getBillingPeriodLabel(billingCycle);

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <BillingCycleToggle
          value={billingCycle}
          onChange={onBillingCycleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {plans.map((plan) => {
        const selected = plan.slug === selectedSlug;
        const popular = plan.badge === "Most Popular";
        const price = getPlanListPrice(plan, billingCycle);
        const compareAtPrice = getPlanCompareAtPrice(plan, billingCycle);

        return (
          <button
            key={plan.slug}
            type="button"
            onClick={() => onSelect(plan.slug)}
            aria-pressed={selected}
            className={`relative flex flex-col rounded-[18px] border p-5 text-left transition ${
              selected
                ? popular
                  ? "border-teal-400/55 bg-[linear-gradient(165deg,rgba(20,184,166,0.16),#0e0a18_55%,#090610)] shadow-[0_0_28px_rgba(20,184,166,0.22)]"
                  : "border-violet-400/50 bg-[linear-gradient(165deg,rgba(139,92,246,0.16),#0e0a18_55%,#090610)] shadow-[0_0_24px_rgba(139,92,246,0.2)]"
                : popular
                  ? "border-teal-500/35 bg-[linear-gradient(165deg,rgba(20,184,166,0.08),#0e0a18_55%,#090610)] hover:border-teal-400/50"
                  : "border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] hover:border-violet-500/40"
            }`}
          >
            {popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-teal-400/40 bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-200">
                Most Popular
              </span>
            )}

            <div className="flex items-start justify-between gap-2">
              <h3 className="lf-orbitron text-base font-bold text-white">
                {plan.name}
              </h3>
              {selected && (
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
            </div>

            <div className="mt-4">
              <PlanPriceDisplay
                price={price}
                compareAtPrice={compareAtPrice}
                periodLabel={periodLabel}
              />
            </div>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-[#94a3b8]">
              {plan.description}
            </p>
          </button>
        );
      })}
      </div>

      <PaymentMethodLogos />
    </div>
  );
}
