"use client";

import PlanPriceDisplay from "@/components/pricing/PlanPriceDisplay";
import {
  getBillingPeriodLabel,
  getPlanCompareAtPrice,
  getPlanListPrice,
  getPricingPlan,
  type BillingCycle,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import { getPlanDetails } from "@/lib/constants/plan-details";

interface MetricsPreviewProps {
  planSlug: PricingPlanSlug;
  billingCycle: BillingCycle;
}

export default function MetricsPreview({
  planSlug,
  billingCycle,
}: MetricsPreviewProps) {
  const pricing = getPricingPlan(planSlug);
  const listPrice = getPlanListPrice(pricing, billingCycle);
  const compareAtPrice = getPlanCompareAtPrice(pricing, billingCycle);
  const periodLabel = getBillingPeriodLabel(billingCycle);
  const details = getPlanDetails(planSlug);

  return (
    <div className="space-y-6">
      <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6">
        <p className="text-sm text-[#94a3b8]">{pricing.name}</p>
        <div className="mt-1">
          <PlanPriceDisplay
            price={listPrice}
            compareAtPrice={compareAtPrice}
            periodLabel={periodLabel}
            size="md"
          />
        </div>
      </div>

      <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-5">
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
          {details.summary}
        </p>
      </div>
    </div>
  );
}
