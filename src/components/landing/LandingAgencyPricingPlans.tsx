"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import BillingCycleToggle from "@/components/pricing/BillingCycleToggle";
import PlanPriceDisplay from "@/components/pricing/PlanPriceDisplay";
import {
  AGENCY_BILLING_CYCLE_NOTE,
  getAgencyCapacityLabel,
  getAgencyPlanListPrice,
  getAgencyPlanYearlySavings,
  listAgencyPricingPlans,
  MAX_AGENCY_YEARLY_SAVINGS_AED,
} from "@/lib/constants/agency-pricing-plans";
import {
  DEFAULT_BILLING_CYCLE,
  getBillingPeriodLabel,
  type BillingCycle,
} from "@/lib/constants/pricing-plans";
import { formatLandingCurrency } from "@/lib/constants/landing-locale";

export default function LandingAgencyPricingPlans() {
  const plans = listAgencyPricingPlans();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    DEFAULT_BILLING_CYCLE,
  );

  const fromPrice = getAgencyPlanListPrice(plans[0]!, billingCycle);
  const periodLabel = getBillingPeriodLabel(billingCycle);

  return (
    <>
      <div className="lf-animate-in mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
          Agency / Freelancer
        </p>
        <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
          Plans from {formatLandingCurrency(fromPrice)}/{periodLabel}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#94a3b8]">
          Manage multiple client profiles from one dashboard with dedicated AEO
          indexing, citation tracking, and scalable client slots.
        </p>
        <div className="mt-6 flex justify-center">
          <BillingCycleToggle
            value={billingCycle}
            onChange={setBillingCycle}
            formatAmount={formatLandingCurrency}
            maxYearlySavings={MAX_AGENCY_YEARLY_SAVINGS_AED}
            showMonthlySavings={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const popular = plan.badge === "Most Popular";
          const price = getAgencyPlanListPrice(plan, billingCycle);
          const capacityLabel = getAgencyCapacityLabel(plan, billingCycle);
          const yearlySavings =
            billingCycle === "yearly"
              ? getAgencyPlanYearlySavings(plan)
              : undefined;
          const accentBorder = popular
            ? "border-teal-500/30 bg-teal-500/10 text-teal-200"
            : "border-violet-500/30 bg-violet-500/10 text-violet-200";

          return (
            <article
              key={plan.slug}
              className={`relative flex flex-col rounded-[18px] border p-5 sm:p-6 ${
                popular
                  ? "border-teal-500/40 bg-[linear-gradient(165deg,rgba(20,184,166,0.12),#0e0a18_55%,#090610)] shadow-[0_0_28px_rgba(20,184,166,0.18)]"
                  : "border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)]"
              }`}
            >
              {popular ? (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-teal-400/40 bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-200">
                  Most Popular · Best Value
                </span>
              ) : null}

              <h3 className="lf-orbitron text-base font-bold text-white sm:text-lg">
                {plan.name}
              </h3>

              <div className="mt-4">
                <PlanPriceDisplay
                  price={price}
                  compareAtPrice={0}
                  periodLabel={periodLabel}
                  savingsAmount={yearlySavings}
                  formatAmount={formatLandingCurrency}
                />
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
                {plan.description}
              </p>

              <div
                className={`mt-4 rounded-xl border px-3 py-3 text-sm leading-relaxed ${accentBorder}`}
              >
                {capacityLabel}
              </div>

              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm leading-snug text-[#cbd5e1]"
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${popular ? "text-teal-300" : "text-violet-300"}`}
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-[#64748b] sm:text-sm">
        {AGENCY_BILLING_CYCLE_NOTE}
      </p>
    </>
  );
}
