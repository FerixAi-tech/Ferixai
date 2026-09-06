"use client";

import { useState } from "react";
import BillingCycleToggle from "@/components/pricing/BillingCycleToggle";
import AgencyPricingCardGrid from "@/components/pricing/AgencyPricingCardGrid";
import {
  AGENCY_BILLING_CYCLE_NOTE,
  getAgencyPlanListPrice,
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

      <AgencyPricingCardGrid billingCycle={billingCycle} />

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-[#64748b] sm:text-sm">
        {AGENCY_BILLING_CYCLE_NOTE}
      </p>
    </>
  );
}
