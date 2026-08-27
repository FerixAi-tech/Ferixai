"use client";

import { useState } from "react";
import Link from "next/link";
import { Orbitron } from "next/font/google";
import BrandLogo from "@/components/layout/BrandLogo";
import SupportContact from "@/components/layout/SupportContact";
import SignupCard from "@/components/landing/SignupCard";
import FuturisticScene3D from "@/components/landing/FuturisticScene3D";
import LandingAppFeatures from "@/components/landing/LandingAppFeatures";
import SupportedAIPlatforms from "@/components/landing/SupportedAIPlatforms";
import LandingCorporateSections from "@/components/landing/LandingCorporateSections";
import LandingPricingPlans from "@/components/landing/LandingPricingPlans";
import GlobalAiNetwork from "@/components/campaign/GlobalAiNetwork";
import LandingSignupCtaLabel, {
  landingSignupButtonClassName,
} from "@/components/landing/LandingSignupCtaLabel";
import "@/components/landing/landing-futuristic.css";
import { listPricingPlans } from "@/lib/constants/pricing-plans";
import { formatCurrency } from "@/lib/constants/metrics";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-orbitron",
});

const STEPS = [
  {
    step: "01",
    title: "Tell us about your business",
    description:
      "Add your business name, category and city. No technical setup required.",
  },
  {
    step: "02",
    title: "Select your growth plan",
    description:
      "Choose how widely FerixAI should prepare content for your business — and how long it should run.",
  },
  {
    step: "03",
    title: "Launch with clarity",
    description:
      "Review the deliverables, launch your campaign, and follow progress in your dashboard.",
  },
] as const;

const TRUST = [
  "Join 500+ UAE local businesses automating their AI visibility.",
  "Dominate local searches on Google, Google Maps, and ChatGPT.",
  "Active across all major UAE cities: Dubai, Abu Dhabi, Sharjah & more.",
  "100% Risk-Free. 14-Day Money-Back Guarantee. Cancel anytime with one click.",
] as const;

const FROM_MONTHLY_GBP = listPricingPlans()[0].priceMonthlyGbp;

export default function HomeLanding({
  openSignup = false,
}: {
  openSignup?: boolean;
}) {
  const [signupOpen, setSignupOpen] = useState(openSignup);

  return (
    <div
      className={`landing-futuristic min-h-screen overflow-x-hidden bg-[#05070c] ${orbitron.variable}`}
    >
      <FuturisticScene3D />
      <div className="lf-grid-overlay" aria-hidden />
      <div className="lf-vignette" aria-hidden />

      <SignupCard open={signupOpen} onClose={() => setSignupOpen(false)} />

      <div className="lf-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hidden md:block">
          <SupportContact variant="topRight" />
        </div>

        <nav className="lf-animate-in flex flex-col items-center gap-5 py-6 sm:py-8">
          <BrandLogo href="/" size="2xl" priority centered />
          <div className="w-full md:hidden">
            <SupportContact />
          </div>
        </nav>

        <section className="grid min-h-0 items-center gap-10 pb-12 pt-2 sm:gap-12 sm:pb-16 lg:grid-cols-2">
          <div className="min-w-0 max-w-xl">
            <div className="lf-animate-in lf-animate-in-1 mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Local visibility for UAE businesses
            </div>

            <h1 className="lf-animate-in lf-animate-in-2 lf-orbitron text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl xl:text-[2.75rem]">
              The System That Puts Your Business at the Top of{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                ChatGPT, Gemini &amp; Claude
              </span>{" "}
              Answers.
            </h1>

            <div className="lf-animate-in lf-animate-in-3 mt-5 space-y-4 text-base leading-relaxed text-[#94a3b8] sm:text-lg">
              <p>
                When local UAE customers ask AI engines like{" "}
                <em className="text-[#e2e8f0]">
                  &quot;Who is the best dentist in Dubai?&quot;
                </em>
                , Ferixai forces AI to recommend{" "}
                <strong className="font-semibold text-white">YOUR</strong>{" "}
                business first—before your competitors.
              </p>
            </div>

            <div className="lf-animate-in lf-animate-in-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setSignupOpen(true)}
                className={landingSignupButtonClassName}
              >
                <LandingSignupCtaLabel />
              </button>
              <a
                href="#pricing"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-700/40 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-[#94a3b8] transition hover:border-fuchsia-500/40 hover:text-[#e2e8f0]"
              >
                View plans from {formatCurrency(FROM_MONTHLY_GBP)}/month
              </a>
            </div>

            <p className="lf-animate-in lf-animate-in-4 mt-3 text-xs font-medium text-[#94a3b8]">
              ✓ No setup fee • Cancel anytime • 14-day money-back guarantee
            </p>

            <div className="lf-animate-in lf-animate-in-5 mt-8 grid grid-cols-3 gap-4">
              <div>
                <p className="lf-orbitron text-xl font-bold text-emerald-300 sm:text-2xl">
                  3+ Major
                </p>
                <p className="mt-1 text-xs tracking-wide text-[#94a3b8]">
                  AI Engines Integrated (ChatGPT, Gemini, Claude)
                </p>
              </div>
              <div>
                <p className="lf-orbitron text-xl font-bold text-emerald-300 sm:text-2xl">
                  100%
                </p>
                <p className="mt-1 text-xs tracking-wide text-[#94a3b8]">
                  Automated Digital Footprint & Review Scanning
                </p>
              </div>
              <div>
                <p className="lf-orbitron text-xl font-bold text-emerald-300 sm:text-2xl">
                  &lt; 48 Hours
                </p>
                <p className="mt-1 text-xs tracking-wide text-[#94a3b8]">
                  Average Time to Appear in Local AI Search Answers
                </p>
              </div>
            </div>
          </div>

          <div className="hidden min-h-[320px] lg:block" aria-hidden />
        </section>

        <section className="pb-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <LandingPricingPlans onClaim={() => setSignupOpen(true)} />

        <section className="pb-12 pt-4" id="how-it-works">
          <div className="lf-animate-in mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
              Process
            </p>
            <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
              Three calm steps to launch
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#94a3b8]">
              Create an account, select your growth plan, and launch. You’ll
              always see what FerixAI will prepare before you continue.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((card) => (
              <article key={card.step} className="lf-neon-card">
                <div className="lf-neon-spin" aria-hidden />
                <div className="lf-neon-inner p-8">
                  <p className="lf-orbitron text-4xl font-extrabold text-emerald-300">
                    {card.step}
                  </p>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white">
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <SupportedAIPlatforms />
        <LandingCorporateSections />
        <LandingAppFeatures />

        <section className="pb-10">
          <GlobalAiNetwork />
        </section>

        <footer className="border-t border-white/5 py-8 text-center text-xs text-[#94a3b8]">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/privacy-policy"
              className="transition hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund-policy"
              className="transition hover:text-white"
            >
              Cancellation &amp; Refund Policy
            </Link>
          </div>
          <p className="mt-6">
            © {new Date().getFullYear()} FerixAI · Visibility for UAE businesses
          </p>
        </footer>
      </div>
    </div>
  );
}
