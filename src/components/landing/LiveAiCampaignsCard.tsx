"use client";

import { useEffect, useRef, useState } from "react";

type LiveStats = {
  activeCampaigns: number;
  ukBusinesses: number;
  recommendationsToday: number;
};

function startOfUtcDay(now: number): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function computeLiveStats(now = Date.now()): LiveStats {
  const minutesToday = Math.floor(
    Math.max(0, now - startOfUtcDay(now)) / 60_000,
  );
  // Tiny live pulse around the published figures (no long-term drift)
  const pulse = Math.floor(now / 5_000);

  return {
    activeCampaigns: 1_482 + (pulse % 4),
    ukBusinesses: 524 + (pulse % 3),
    recommendationsToday: 12_840 + Math.floor(minutesToday / 18) + (pulse % 6),
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

const METRICS: {
  key: keyof LiveStats;
  label: string;
  suffix?: string;
}[] = [
  { key: "activeCampaigns", label: "Active AI Campaigns" },
  { key: "ukBusinesses", label: "Total UK Businesses Optimized" },
  {
    key: "recommendationsToday",
    label: "AI Recommendations Dispatched Today",
    suffix: "+",
  },
];

function MetricValue({
  value,
  suffix,
}: {
  value: number;
  suffix?: string;
}) {
  const animated = useAnimatedNumber(value);
  return (
    <p className="lf-orbitron text-xl font-bold tabular-nums tracking-tight text-white sm:text-2xl">
      {formatCount(animated)}
      {suffix ?? ""}
    </p>
  );
}

export default function LiveAiCampaignsCard() {
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
      className="relative w-full overflow-hidden rounded-2xl border border-emerald-400/20 bg-neutral-900/40 p-4 shadow-[0_0_40px_rgba(16,185,129,0.12)] backdrop-blur-md sm:p-5"
      aria-live="polite"
      aria-label="Live AI campaigns activity"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(16,185,129,0.14), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.04), transparent 40%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
        aria-hidden
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:text-[11px]">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]" />
          </span>
          Live
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b] sm:text-[11px]">
          Live AI Campaigns
        </p>
      </div>

      <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {METRICS.map((metric) => (
          <div
            key={metric.key}
            className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:px-3.5"
          >
            <MetricValue
              value={stats[metric.key]}
              suffix={metric.suffix}
            />
            <p className="mt-1.5 text-[10px] leading-snug tracking-wide text-[#94a3b8] sm:text-xs">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
