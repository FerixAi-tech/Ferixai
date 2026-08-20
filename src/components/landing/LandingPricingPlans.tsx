"use client";

import { listPricingPlans } from "@/lib/constants/pricing-plans";
import { formatCurrency } from "@/lib/constants/metrics";
import LandingSignupCtaLabel, {
  landingSignupButtonClassName,
} from "@/components/landing/LandingSignupCtaLabel";

export default function LandingPricingPlans({
  onClaim,
}: {
  onClaim?: () => void;
}) {
  const plans = listPricingPlans();
  const fromPrice = plans[0]?.priceMonthlyGbp ?? 59;

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
          Every plan indexes your business across ChatGPT, Gemini, and Claude
          for local recommendation queries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
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
                <p className="lf-orbitron text-3xl font-bold text-white">
                  {formatCurrency(plan.priceMonthlyGbp)}
                  <span className="ml-1 text-sm font-semibold text-[#94a3b8]">
                    /month
                  </span>
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
        <div className="mx-auto mt-8 flex w-full max-w-xl justify-center">
          <button
            type="button"
            onClick={onClaim}
            className={landingSignupButtonClassName}
          >
            <LandingSignupCtaLabel />
          </button>
        </div>
      ) : null}
    </section>
  );
}
