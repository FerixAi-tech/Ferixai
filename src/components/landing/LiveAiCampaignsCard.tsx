"use client";

import { useEffect, useRef, useState } from "react";

type LiveStats = {
  globalActiveBusinesses: number;
  globalActiveCampaigns: number;
};

const BASE_GLOBAL_ACTIVE_BUSINESSES = 12_745;
const BASE_GLOBAL_ACTIVE_CAMPAIGNS = 27_458;

function computeLiveStats(now = Date.now()): LiveStats {
  const pulse = Math.floor(now / 5_000);

  return {
    globalActiveBusinesses:
      BASE_GLOBAL_ACTIVE_BUSINESSES + (pulse % 3),
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

const METRICS: {
  key: keyof LiveStats;
  label: string;
}[] = [
  {
    key: "globalActiveBusinesses",
    label: "Global active businesses using FerixAI",
  },
  {
    key: "globalActiveCampaigns",
    label: "Global active campaigns",
  },
];

function MetricValue({ value }: { value: number }) {
  const animated = useAnimatedNumber(value);
  return (
    <p className="lf-orbitron text-xl font-bold tabular-nums tracking-tight text-white sm:text-2xl">
      {formatCount(animated)}
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

      <div className="relative flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]" />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:text-[11px]">
          Live global activity
        </p>
      </div>

      <div className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {METRICS.map((metric) => (
          <div
            key={metric.key}
            className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:px-3.5"
          >
            <MetricValue value={stats[metric.key]} />
            <p className="mt-1.5 text-[10px] leading-snug tracking-wide text-[#94a3b8] sm:text-xs">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
