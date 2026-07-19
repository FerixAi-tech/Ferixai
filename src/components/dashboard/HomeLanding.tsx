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
import GlobalAiNetwork from "@/components/campaign/GlobalAiNetwork";
import LiveAiCampaignsCard from "@/components/landing/LiveAiCampaignsCard";
import "@/components/landing/landing-futuristic.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-orbitron",
});

const LOGIN_HREF = "/auth?redirect=/dashboard";

const STEPS = [
  {
    step: "01",
    title: "Tell us about your business",
    description:
      "Add your business name, category and town. No technical setup required.",
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
  "Join 500+ UK local businesses automating their local SEO.",
  "Dominate local searches on Google, Google Maps, and ChatGPT.",
  "Active across all major UK cities: London, Manchester, Bristol & more.",
  "100% Risk-Free. 14-Day Money-Back Guarantee. Cancel anytime with one click.",
] as const;

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
          <div className="flex w-full max-w-lg flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setSignupOpen(true)}
              className="lf-btn-primary touch-target relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-base font-bold tracking-wide text-white sm:min-w-[300px]"
            >
              <span aria-hidden className="text-[1.05em] leading-none">
                🚀
              </span>
              <span>Claim My £30 Code & Start Free</span>
              <span aria-hidden className="tracking-normal">
                →
              </span>
            </button>
            <p className="text-sm text-[#94a3b8]">
              Already have an account?{" "}
              <Link
                href={LOGIN_HREF}
                className="font-semibold text-fuchsia-300 transition hover:text-pink-200 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </nav>

        <section className="grid min-h-0 items-center gap-10 pb-12 pt-2 sm:gap-12 sm:pb-16 lg:grid-cols-2">
          <div className="min-w-0 max-w-xl">
            <div className="lf-animate-in lf-animate-in-1 mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Local visibility for UK businesses
            </div>

            <h1 className="lf-animate-in lf-animate-in-2 lf-orbitron text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl xl:text-[2.75rem]">
              Would you like{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                AI to recommend
              </span>{" "}
              your business with a £30 welcome budget?
            </h1>

            <div className="lf-animate-in lf-animate-in-3 mt-5 space-y-4 text-base leading-relaxed text-[#94a3b8] sm:text-lg">
              <p>
                Millions of people ask ChatGPT or Gemini questions like:{" "}
                <em className="text-[#e2e8f0]">
                  “What is the best dental clinic in London?”
                </em>
                . If your business isn&apos;t there, you are losing customers.
              </p>
              <p>
                <strong className="font-semibold text-white">
                  Claim your £30 welcome credit today.
                </strong>{" "}
                Sign up below, get your exclusive promo code instantly, and
                launch with £30 off your first month.
              </p>
            </div>

            <div className="mt-6">
              <LiveAiCampaignsCard />
            </div>

            <div className="lf-animate-in lf-animate-in-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setSignupOpen(true)}
                className="lf-btn-primary relative inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold tracking-wide text-white"
              >
                <span aria-hidden className="text-[1.05em] leading-none">
                  🚀
                </span>
                <span>Claim My £30 Code & Start Free</span>
                <span aria-hidden className="tracking-normal">
                  →
                </span>
              </button>
              <a
                href="#how-it-works"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-700/40 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-[#94a3b8] transition hover:border-fuchsia-500/40 hover:text-[#e2e8f0]"
              >
                How it works
              </a>
            </div>

            <div className="lf-animate-in lf-animate-in-5 mt-8 grid grid-cols-3 gap-4">
              <div>
                <p className="lf-orbitron text-xl font-bold text-emerald-300 sm:text-2xl">
                  3+ Major
                </p>
                <p className="mt-1 text-xs tracking-wide text-[#94a3b8]">
                  AI Engines Integrated (ChatGPT, Gemini, Perplexity)
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

        <section className="pb-16">
          <div className="lf-card-border rounded-3xl p-[1px]">
            <div className="rounded-[23px] bg-[rgba(8,12,18,0.96)] px-6 py-10 text-center sm:px-12">
              <h2 className="lf-orbitron text-2xl font-bold text-white sm:text-3xl">
                Ready to show up when people ask AI?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-[#94a3b8]">
                Sign up, get your £30 promo code instantly, and launch with £30
                off your first month — no credit card needed to explore.
              </p>
              <button
                type="button"
                onClick={() => setSignupOpen(true)}
                className="lf-btn-primary mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-8 py-3 font-bold tracking-wide text-white"
              >
                <span aria-hidden className="text-[1.05em] leading-none">
                  🚀
                </span>
                <span>Claim My £30 Code & Start Free</span>
                <span aria-hidden className="tracking-normal">
                  →
                </span>
              </button>
              <p className="mx-auto mt-4 max-w-lg text-center text-[11px] leading-relaxed tracking-wide text-[#64748b]">
                One-time promo code valid for new verified business names only
                to prevent abuse. No credit card required to explore.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 text-center text-xs text-[#94a3b8]">
          © {new Date().getFullYear()} FerixAI · Visibility for UK businesses
        </footer>
      </div>
    </div>
  );
}
