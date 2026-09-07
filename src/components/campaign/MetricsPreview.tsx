"use client";

import PlanPriceDisplay from "@/components/pricing/PlanPriceDisplay";
import {
  getAgencyCapacityLabel,
  getAgencyPlanYearlySavings,
  getAgencyPricingPlan,
  isAgencyPlanSlug,
} from "@/lib/constants/agency-pricing-plans";
import {
  getCheckoutContentPlanSlug,
  getCheckoutPlanListPrice,
  getCheckoutPlanName,
  type CheckoutPlanSlug,
} from "@/lib/constants/checkout-plans";
import {
  getBillingPeriodLabel,
  getPlanCompareAtPrice,
  getPlanYearlySavings,
  getPricingPlan,
  type BillingCycle,
} from "@/lib/constants/pricing-plans";
import { getPlanDetails, getPlanDetailsSummary } from "@/lib/constants/plan-details";

interface MetricsPreviewProps {
  planSlug: CheckoutPlanSlug;
  billingCycle: BillingCycle;
  variant?: "full" | "inclusions";
}

export default function MetricsPreview({
  planSlug,
  billingCycle,
  variant = "full",
}: MetricsPreviewProps) {
  const planName = getCheckoutPlanName(planSlug);
  const listPrice = getCheckoutPlanListPrice(planSlug, billingCycle);
  const periodLabel = getBillingPeriodLabel(billingCycle);
  const isAgency = isAgencyPlanSlug(planSlug);

  const compareAtPrice = isAgency
    ? 0
    : getPlanCompareAtPrice(getPricingPlan(planSlug), billingCycle);
  const yearlySavings = isAgency
    ? billingCycle === "yearly"
      ? getAgencyPlanYearlySavings(getAgencyPricingPlan(planSlug))
      : undefined
    : billingCycle === "yearly"
      ? getPlanYearlySavings(getPricingPlan(planSlug))
      : undefined;

  const contentPlanSlug = getCheckoutContentPlanSlug(planSlug);
  const details = getPlanDetails(contentPlanSlug);
  const detailsSummary = isAgency
    ? getAgencyCapacityLabel(getAgencyPricingPlan(planSlug), billingCycle)
    : getPlanDetailsSummary(contentPlanSlug, billingCycle);

  const inclusionsContent = isAgency ? (
    <p className="text-sm leading-relaxed text-[#cbd5e1]">{detailsSummary}</p>
  ) : (
    <>
      <dl className="space-y-3">
        {details.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
              {metric.label}
            </dt>
            <dd className="mt-0.5 text-sm leading-snug text-white">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-[#cbd5e1]">
        {detailsSummary}
      </p>
    </>
  );

  if (variant === "inclusions") {
    return <div className="space-y-1">{inclusionsContent}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6">
        <p className="text-sm text-[#94a3b8]">{planName}</p>
        <div className="mt-1">
          <PlanPriceDisplay
            price={listPrice}
            compareAtPrice={compareAtPrice}
            periodLabel={periodLabel}
            savingsAmount={yearlySavings}
            size="md"
          />
        </div>
      </div>

      <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-5">
        {inclusionsContent}
      </div>
    </div>
  );
}
