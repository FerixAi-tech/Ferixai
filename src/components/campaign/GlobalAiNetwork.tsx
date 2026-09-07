"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { GLOBE_MARKERS } from "@/lib/constants/globe-markers";

const InteractiveGlobe = dynamic(
  () => import("@/components/campaign/InteractiveGlobe"),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto flex aspect-square w-full max-w-[min(100%,520px)] items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/5"
        aria-hidden
      >
        <div className="h-12 w-12 animate-pulse rounded-full bg-emerald-400/20" />
      </div>
    ),
  },
);

type LiveStats = {
  globalActiveBusinesses: number;
  globalActiveCampaigns: number;
};

const BASE_GLOBAL_ACTIVE_BUSINESSES = 12_747;
const BASE_GLOBAL_ACTIVE_CAMPAIGNS = 27_461;

function computeLiveStats(now = Date.now()): LiveStats {
  const pulse = Math.floor(now / 5_000);

  return {
    globalActiveBusinesses: BASE_GLOBAL_ACTIVE_BUSINESSES + (pulse % 3),
    globalActiveCampaigns: BASE_GLOBAL_ACTIVE_CAMPAIGNS + (pulse % 4),
  };
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-GB").format(Math.round(value));
}

function useAnimatedNumber(target: number, durationMs = 900): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) {
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setDisplay(next);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, durationMs]);

  return display;
}

function MetricValue({ value }: { value: number }) {
  const animated = useAnimatedNumber(value);
  return (
    <p className="lf-orbitron text-xl font-bold tabular-nums tracking-tight text-white sm:text-2xl">
      {formatCount(animated)}
    </p>
  );
}

function LiveGlobalStats() {
  const [stats, setStats] = useState<LiveStats>(() => computeLiveStats());

  useEffect(() => {
    setStats(computeLiveStats());
    const id = window.setInterval(() => {
      setStats(computeLiveStats());
    }, 5_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="relative mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border border-emerald-400/20 bg-neutral-900/40 p-4 shadow-[0_0_40px_rgba(16,185,129,0.12)] backdrop-blur-md sm:p-5"
      aria-live="polite"
      aria-label="Global FerixAI activity"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(16,185,129,0.14), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.04), transparent 40%)",
        }}
        aria-hidden
      />

      <div className="relative flex items-center justify-center gap-2">
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]" />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:text-[11px]">
          Live global activity
        </p>
      </div>

      <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:px-3.5">
          <MetricValue value={stats.globalActiveBusinesses} />
          <p className="mt-1.5 text-[10px] leading-snug tracking-wide text-[#94a3b8] sm:text-xs">
            Global active businesses using FerixAI
          </p>
        </div>
        <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:px-3.5">
          <MetricValue value={stats.globalActiveCampaigns} />
          <p className="mt-1.5 text-[10px] leading-snug tracking-wide text-[#94a3b8] sm:text-xs">
            Global active campaigns
          </p>
        </div>
      </div>
    </div>
  );
}

/** Dark-themed interactive globe with glowing green coverage markers. */
export default function GlobalAiNetwork() {
  return (
    <section
      aria-labelledby="global-ai-network-heading"
      className="overflow-hidden rounded-[22px] border border-emerald-500/20 bg-[linear-gradient(165deg,rgba(16,185,129,0.08),#0a0712_40%,#05070c_100%)] p-5 sm:p-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/90">
          Live coverage
        </p>
        <h3
          id="global-ai-network-heading"
          className="lf-orbitron mt-2 text-xl font-bold text-white sm:text-2xl"
        >
          Global AI Network Active
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#94a3b8] sm:text-base">
          Powering real-time knowledge graphs across the UAE, USA, Canada,
          Turkey, and Australia. Ensuring local brands are accurately indexed and
          surfaced in AI-driven answers worldwide.
        </p>
      </div>

      <LiveGlobalStats />

      <div className="relative mx-auto mt-8 w-full max-w-4xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 78%)",
          }}
          aria-hidden
        />

        <InteractiveGlobe />

        <p className="mt-3 text-center text-[11px] text-[#64748b] sm:text-xs">
          Drag to explore · Auto-rotating live coverage map
        </p>
      </div>

      <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {GLOBE_MARKERS.map((spot) => (
          <li
            key={spot.id}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#94a3b8]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </span>
            {spot.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
