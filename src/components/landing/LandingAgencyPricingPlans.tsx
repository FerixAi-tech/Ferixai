"use client";

import AgencyPricingCardGrid from "@/components/pricing/AgencyPricingCardGrid";
import {
  AGENCY_BILLING_CYCLE_NOTE,
  AGENCY_ONBOARDING_HOW_IT_WORKS,
} from "@/lib/constants/agency-pricing-plans";
import { type BillingCycle } from "@/lib/constants/pricing-plans";

export default function LandingAgencyPricingPlans({
  billingCycle,
}: {
  billingCycle: BillingCycle;
}) {
  return (
    <>
      <AgencyPricingCardGrid billingCycle={billingCycle} />

      <div className="mx-auto mt-6 max-w-3xl space-y-2 text-center text-xs leading-relaxed text-[#64748b] sm:text-sm">
        <p>{AGENCY_BILLING_CYCLE_NOTE}</p>
        <p>{AGENCY_ONBOARDING_HOW_IT_WORKS}</p>
      </div>
    </>
  );
}
