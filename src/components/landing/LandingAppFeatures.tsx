"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FEATURES = [
  {
    id: "content",
    title: "Content prepared for you",
    description:
      "We draft professional articles shaped around your business, town and category.",
    detail:
      "Your plan determines how many pieces we prepare. You can see the expected output before you launch.",
  },
  {
    id: "publish",
    title: "Publishing that stays organised",
    description:
      "Content is published on FerixAI and, when configured, to additional channels.",
    detail:
      "WordPress and Dev.to publishing are optional. Your FerixAI article remains the primary record.",
  },
  {
    id: "panel",
    title: "A clear campaign dashboard",
    description:
      "Track status, plan intensity, duration and published links from one place.",
    detail:
      "No surprise fees in this development version. Payment can be added later without changing the core workflow.",
  },
] as const;

export default function LandingAppFeatures() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="pb-20 pt-4" id="features">
      <div className="mb-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
          What you get
        </p>
        <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
          Everything needed to launch with confidence
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => {
          const open = expandedId === feature.id;
          return (
            <article key={feature.id} className="lf-neon-card">
              <div className="lf-neon-spin" aria-hidden />
              <div className="lf-neon-inner p-6">
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white">
                  {feature.description}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId((current) =>
                      current === feature.id ? null : feature.id,
                    )
                  }
                  className="mt-5 flex w-full items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-emerald-200"
                  aria-expanded={open}
                >
                  Learn more
                  <ChevronDown
                    className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-xs leading-relaxed text-white">
                    {feature.detail}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
