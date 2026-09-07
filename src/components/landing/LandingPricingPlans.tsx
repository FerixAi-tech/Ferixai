"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import BillingCycleToggle from "@/components/pricing/BillingCycleToggle";
import PlanPriceDisplay from "@/components/pricing/PlanPriceDisplay";
import PricingAudienceToggle, {
  type PricingAudience,
} from "@/components/pricing/PricingAudienceToggle";
import PaymentMethodLogos from "@/components/payment/PaymentMethodLogos";
import LandingAgencyPricingPlans from "@/components/landing/LandingAgencyPricingPlans";
import {
  DEFAULT_BILLING_CYCLE,
  getBillingPeriodLabel,
  getPlanCompareAtPrice,
  getPlanListPrice,
  getPlanYearlySavings,
  listPricingPlans,
  MAX_YEARLY_SAVINGS_AED,
  type BillingCycle,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import {
  getAgencyPlanListPrice,
  listAgencyPricingPlans,
  MAX_AGENCY_YEARLY_SAVINGS_AED,
} from "@/lib/constants/agency-pricing-plans";
import {
  formatLandingCurrency,
  getLandingPlanDetailsSummary,
} from "@/lib/constants/landing-locale";
import { getPlanDetails } from "@/lib/constants/plan-details";
import LandingSignupCtaLabel, {
  landingSignupButtonClassName,
} from "@/components/landing/LandingSignupCtaLabel";
import CheckoutTrustBadges from "@/components/payment/CheckoutTrustBadges";
import { captureCheckoutInitiated } from "@/lib/posthog/client";

export default function LandingPricingPlans({
  onClaim,
}: {
  onClaim?: () => void;
}) {
  const businessPlans = listPricingPlans();
  const agencyPlans = listAgencyPricingPlans();
  const [audience, setAudience] = useState<PricingAudience>("business");
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>(DEFAULT_BILLING_CYCLE);
  const [expandedSlug, setExpandedSlug] = useState<PricingPlanSlug | null>(
    null,
  );

  const periodLabel = getBillingPeriodLabel(billingCycle);
  const fromPrice =
    audience === "agency"
      ? getAgencyPlanListPrice(agencyPlans[0]!, billingCycle)
      : getPlanListPrice(businessPlans[0]!, billingCycle);
  const headerDescription =
    audience === "agency"
      ? "Manage multiple client profiles from one dashboard with dedicated AEO indexing, citation tracking, and scalable client slots."
      : "Every plan indexes your business across ChatGPT, Gemini, and Claude for local recommendation queries.";

  function handlePricingClaim() {
    const planName =
      audience === "agency"
        ? listAgencyPricingPlans()[1]?.name ?? "Agency Growth"
        : businessPlans[1]?.name ?? "Growth Plan";
    captureCheckoutInitiated(planName, { source: "landing_pricing_cta" });
    onClaim?.();
  }

  return (
    <section className="pb-16 pt-4" id="pricing">
      <div className="lf-animate-in mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Pricing
        </p>
        <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
          Plans from {formatLandingCurrency(fromPrice)}/{periodLabel}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#94a3b8]">
          {headerDescription}
        </p>

        <div className="mt-6 flex justify-center">
          <PricingAudienceToggle value={audience} onChange={setAudience} />
        </div>

        <div className="mt-4 flex justify-center">
          <BillingCycleToggle
            value={billingCycle}
            onChange={setBillingCycle}
            formatAmount={formatLandingCurrency}
            maxYearlySavings={
              audience === "agency"
                ? MAX_AGENCY_YEARLY_SAVINGS_AED
                : MAX_YEARLY_SAVINGS_AED
            }
            showMonthlySavings={audience === "business"}
          />
        </div>
      </div>

      {audience === "agency" ? (
        <LandingAgencyPricingPlans billingCycle={billingCycle} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businessPlans.map((plan) => {
            const popular = plan.badge === "Most Popular";
            const open = expandedSlug === plan.slug;
            const details = getPlanDetails(plan.slug);
            const detailsSummary = getLandingPlanDetailsSummary(
              plan.slug,
              billingCycle,
            );
            const price = getPlanListPrice(plan, billingCycle);
            const compareAtPrice = getPlanCompareAtPrice(plan, billingCycle);
            const yearlySavings =
              billingCycle === "yearly"
                ? getPlanYearlySavings(plan)
                : undefined;
            const accentBorder = popular
              ? "border-teal-500/30 bg-teal-500/10 text-teal-200"
              : "border-violet-500/30 bg-violet-500/10 text-violet-200";

            return (
              <article
                key={plan.slug}
                className={`relative flex flex-col rounded-[18px] border p-5 ${
                  popular
                    ? "border-teal-500/40 bg-[linear-gradient(165deg,rgba(20,184,166,0.12),#0e0a18_55%,#090610)] shadow-[0_0_28px_rgba(20,184,166,0.18)]"
                    : "border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)]"
                }`}
              >
                {popular ? (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-teal-400/40 bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-200">
                    Most Popular
                  </span>
                ) : null}

                <h3 className="lf-orbitron text-base font-bold text-white">
                  {plan.name}
                </h3>

                <div className="mt-4">
                  <PlanPriceDisplay
                    price={price}
                    compareAtPrice={compareAtPrice}
                    periodLabel={periodLabel}
                    savingsAmount={yearlySavings}
                    formatAmount={formatLandingCurrency}
                  />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
                  {plan.description}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setExpandedSlug((current) =>
                      current === plan.slug ? null : plan.slug,
                    )
                  }
                  className={`mt-5 flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider ${accentBorder}`}
                  aria-expanded={open}
                >
                  View details
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`rounded-xl border px-3 py-3 ${accentBorder}`}
                    >
                      <dl className="space-y-2.5">
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
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {audience === "business" ? (
        <div className="mx-auto mt-6 max-w-2xl">
          <CheckoutTrustBadges />
        </div>
      ) : null}

      <PaymentMethodLogos className="mt-10" />

      {onClaim ? (
        <div className="mx-auto mt-8 flex w-full max-w-xl justify-center">
          <button
            type="button"
            onClick={handlePricingClaim}
            className={landingSignupButtonClassName}
          >
            <LandingSignupCtaLabel />
          </button>
        </div>
      ) : null}
    </section>
  );
}
