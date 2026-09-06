"use client";

import { Check } from "lucide-react";
import PlanPriceDisplay from "@/components/pricing/PlanPriceDisplay";
import {
  getAgencyCapacityLabel,
  getAgencyPlanListPrice,
  getAgencyPlanYearlySavings,
  listAgencyPricingPlans,
  type AgencyPlanSlug,
} from "@/lib/constants/agency-pricing-plans";
import { getBillingPeriodLabel, type BillingCycle } from "@/lib/constants/pricing-plans";
import { formatLandingCurrency } from "@/lib/constants/landing-locale";

export default function AgencyPricingCardGrid({
  billingCycle,
  selectable = false,
  selectedSlug,
  onSelect,
  formatAmount = formatLandingCurrency,
}: {
  billingCycle: BillingCycle;
  selectable?: boolean;
  selectedSlug?: AgencyPlanSlug;
  onSelect?: (slug: AgencyPlanSlug) => void;
  formatAmount?: (amount: number) => string;
}) {
  const plans = listAgencyPricingPlans();
  const periodLabel = getBillingPeriodLabel(billingCycle);

  return (
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
        const selected = selectable && selectedSlug === plan.slug;

        const cardClass = selectable
          ? `relative flex flex-col rounded-[18px] border p-5 text-left transition sm:p-6 ${
              selected
                ? popular
                  ? "border-teal-400/55 bg-[linear-gradient(165deg,rgba(20,184,166,0.16),#0e0a18_55%,#090610)] shadow-[0_0_28px_rgba(20,184,166,0.22)]"
                  : "border-violet-400/50 bg-[linear-gradient(165deg,rgba(139,92,246,0.16),#0e0a18_55%,#090610)] shadow-[0_0_24px_rgba(139,92,246,0.2)]"
                : popular
                  ? "border-teal-500/35 bg-[linear-gradient(165deg,rgba(20,184,166,0.08),#0e0a18_55%,#090610)] hover:border-teal-400/50"
                  : "border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] hover:border-violet-500/40"
            }`
          : `relative flex flex-col rounded-[18px] border p-5 sm:p-6 ${
              popular
                ? "border-teal-500/40 bg-[linear-gradient(165deg,rgba(20,184,166,0.12),#0e0a18_55%,#090610)] shadow-[0_0_28px_rgba(20,184,166,0.18)]"
                : "border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)]"
            }`;

        const inner = (
          <>
            {popular ? (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-teal-400/40 bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-200">
                Most Popular · Best Value
              </span>
            ) : null}

            <div className="flex items-start justify-between gap-2">
              <h3 className="lf-orbitron text-base font-bold text-white sm:text-lg">
                {plan.name}
              </h3>
              {selected ? (
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
              ) : null}
            </div>

            <div className="mt-4">
              <PlanPriceDisplay
                price={price}
                compareAtPrice={0}
                periodLabel={periodLabel}
                savingsAmount={yearlySavings}
                formatAmount={formatAmount}
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
          </>
        );

        if (selectable && onSelect) {
          return (
            <button
              key={plan.slug}
              type="button"
              onClick={() => onSelect(plan.slug)}
              aria-pressed={selected}
              className={cardClass}
            >
              {inner}
            </button>
          );
        }

        return (
          <article key={plan.slug} className={cardClass}>
            {inner}
          </article>
        );
      })}
    </div>
  );
}
