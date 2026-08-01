"use client";

import {
  applyPromoDiscount,
  listPricingPlans,
  PROMO_DISCOUNT_GBP,
} from "@/lib/constants/pricing-plans";
import { formatCurrency } from "@/lib/constants/metrics";
import LandingPromoCountdown from "@/components/landing/LandingPromoCountdown";

export default function LandingPricingPlans({
  onClaim,
}: {
  onClaim?: () => void;
}) {
  const plans = listPricingPlans();
  const fromPrice = applyPromoDiscount(
    plans[0]?.priceMonthlyGbp ?? 39,
    PROMO_DISCOUNT_GBP,
  ).payable;

  return (
    <section className="pb-16 pt-4" id="pricing">
      <div className="lf-animate-in mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Pricing
        </p>
        <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
          Plans from {formatCurrency(fromPrice)}/month
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#94a3b8]">
          First-month prices below include your £{PROMO_DISCOUNT_GBP} welcome
          credit with code FX30. Every plan indexes your business across
          ChatGPT, Gemini, and Claude for local recommendation queries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const { listPrice, payable } = applyPromoDiscount(
            plan.priceMonthlyGbp,
            PROMO_DISCOUNT_GBP,
          );
          const popular = plan.badge === "Most Popular";

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
                <p className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm text-[#64748b] line-through">
                    {formatCurrency(listPrice)}
                  </span>
                  <span className="lf-orbitron text-3xl font-bold text-emerald-300">
                    {formatCurrency(payable)}
                  </span>
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-200/90">
                  first month · then {formatCurrency(listPrice)}/month
                </p>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#94a3b8]">
                {plan.description}
              </p>
            </article>
          );
        })}
      </div>

      {onClaim ? (
        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={onClaim}
            className="lf-btn-primary inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-8 py-3 font-bold tracking-wide text-white"
          >
            <span>Claim £30 OFF &amp; Start for £9</span>
            <span aria-hidden>→</span>
          </button>
          <LandingPromoCountdown align="center" />
        </div>
      ) : null}
    </section>
  );
}
