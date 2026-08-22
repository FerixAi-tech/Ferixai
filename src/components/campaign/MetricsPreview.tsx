"use client";

import { getPricingPlan, type PricingPlanSlug } from "@/lib/constants/pricing-plans";
import { getPlanDetails } from "@/lib/constants/plan-details";
import {
  formatCurrency,
  getCampaignContentPlanForPlan,
} from "@/lib/constants/metrics";

interface MetricsPreviewProps {
  planSlug: PricingPlanSlug;
}

export default function MetricsPreview({ planSlug }: MetricsPreviewProps) {
  const pricing = getPricingPlan(planSlug);
  const listPrice = pricing.priceMonthlyGbp;
  const contentPlan = getCampaignContentPlanForPlan(pricing, listPrice);
  const details = getPlanDetails(planSlug);

  return (
    <div className="space-y-6">
      <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6">
        <p className="text-sm text-[#94a3b8]">{pricing.name}</p>
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
