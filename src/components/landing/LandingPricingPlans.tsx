"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  listPricingPlans,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import { formatCurrency } from "@/lib/constants/metrics";
import LandingSignupCtaLabel, {
  landingSignupButtonClassName,
} from "@/components/landing/LandingSignupCtaLabel";

const PLAN_DETAILS: Record<
  PricingPlanSlug,
  {
    metrics: { label: string; value: string }[];
    summary: string;
  }
> = {
  starter: {
    metrics: [
      {
        label: "AI Recommendation Volume",
        value: "Featured in ~500–1,000 AI Queries / mo",
      },
      {
        label: "Reach",
        value: "~2,500 Potential Customers / month",
      },
      {
        label: "AI Indexing Speed",
        value: "7–10 Days (Standard Rollout)",
      },
      {
        label: "Coverage",
        value: "Core local searches on ChatGPT, Gemini & Claude",
      },
      {
        label: "Tracking",
        value: "Weekly visibility updates",
      },
    ],
    summary:
      "The Starter Plan gives your business an active, verified presence across top AI platforms. It ensures that when nearby customers ask ChatGPT, Gemini, or Claude for essential services in your category, your business is indexed and recommended in standard local search queries within 7–10 days.",
  },
  growth: {
    metrics: [
      {
        label: "AI Recommendation Volume",
        value: "Featured in ~3,000–5,000 AI Queries / mo",
      },
      {
        label: "Reach",
        value: "~12,000 Potential Customers / month",
      },
      {
        label: "AI Indexing Speed",
        value: "Accelerated: 4–6 Days",
      },
      {
        label: "Coverage",
        value: "Expanded multi-query variations & high-intent searches",
      },
      {
        label: "Tracking",
        value: "Priority data refresh & active prompt monitoring",
      },
    ],
    summary:
      "Designed for businesses ready to scale their lead flow. Growth accelerates your indexing to just 4–6 days and expands your footprint to thousands of specific customer search variations (pricing, top-rated, best alternatives), delivering nearly 5× more exposure to high-intent buyers in your region.",
  },
  premium: {
    metrics: [
      {
        label: "AI Recommendation Volume",
        value: "Featured in 10,000+ AI Queries / mo",
      },
      {
        label: "Reach",
        value: "~30,000+ Potential Customers / month",
      },
      {
        label: "AI Indexing Speed",
        value: "Ultra-Fast: Under 48 Hours",
      },
      {
        label: "Coverage",
        value: "Complete market dominance across all local & regional queries",
      },
      {
        label: "Tracking",
        value: "Real-time priority push & competitor displacement",
      },
    ],
    summary:
      "Built for market leaders who want to outrank local competitors instantly. With priority indexing in under 48 hours and aggressive network distribution, your business becomes the #1 go-to recommendation across 10,000+ monthly AI queries across your entire city and surrounding areas.",
  },
};

export default function LandingPricingPlans({
  onClaim,
}: {
  onClaim?: () => void;
}) {
  const plans = listPricingPlans();
  const fromPrice = plans[0]?.priceMonthlyGbp ?? 59;
  const [expandedSlug, setExpandedSlug] = useState<PricingPlanSlug | null>(
    null,
  );

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
          const open = expandedSlug === plan.slug;
          const details = PLAN_DETAILS[plan.slug];
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
                <p className="lf-orbitron text-3xl font-bold text-white">
                  {formatCurrency(plan.priceMonthlyGbp)}
                  <span className="ml-1 text-sm font-semibold text-[#94a3b8]">
                    /month
                  </span>
                </p>
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
                      {details.summary}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div
        className="mx-auto mt-10 flex max-w-3xl flex-col items-center"
        aria-label="Accepted payment methods"
      >
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
          <div className="flex h-[4.25rem] w-[11.5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[13rem]">
            <Image
              src="/birlesik.png"
              alt="Apple Pay and Google Pay"
              width={360}
              height={96}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex h-[4.25rem] w-[5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[5.75rem]">
            <Image
              src="/visa.png"
              alt="Visa"
              width={96}
              height={64}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex h-[4.25rem] w-[5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[5.75rem]">
            <Image
              src="/mastercard.png"
              alt="Mastercard"
              width={96}
              height={64}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex h-[4.25rem] w-[5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[5.75rem]">
            <Image
              src="/stripe.png"
              alt="Stripe"
              width={140}
              height={64}
              className="max-h-full max-w-full scale-[1.45] object-contain"
            />
          </div>
        </div>
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
