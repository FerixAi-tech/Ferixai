"use client";

import AgencyPricingCardGrid from "@/components/pricing/AgencyPricingCardGrid";
import {
  AGENCY_BILLING_CYCLE_NOTE,
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

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-[#64748b] sm:text-sm">
        {AGENCY_BILLING_CYCLE_NOTE}
      </p>
    </>
  );
}
