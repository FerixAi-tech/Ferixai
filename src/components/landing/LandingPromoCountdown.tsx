"use client";

import { useEffect, useState } from "react";

/**
 * Shared absolute deadline for the landing promo countdown.
 * All visitors see the same remaining time; refresh does not reset it.
 * Seeded to ~0d 20h 59m from 2026-08-08 12:29 Europe/Istanbul.
 */
export const LANDING_PROMO_ENDS_AT_MS = Date.parse(
  "2026-08-09T09:28:00+03:00",
);

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function getRemaining(nowMs: number): Remaining {
  const total = Math.max(0, LANDING_PROMO_ENDS_AT_MS - nowMs);
  const totalSeconds = Math.floor(total / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days,
    hours,
    minutes,
    seconds,
    expired: totalSeconds <= 0,
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function Unit({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-[3.25rem] flex-col items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 sm:min-w-[3.75rem] sm:px-2.5">
      <span className="lf-orbitron text-lg font-bold tabular-nums text-emerald-200 sm:text-xl">
        {value}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300/80">
        {label}
      </span>
    </div>
  );
}

export default function LandingPromoCountdown({
  className = "",
  align = "left",
}: {
  className?: string;
  align?: "left" | "center";
}) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Avoid SSR/client mismatch — render shell until mounted.
  const display = remaining ?? {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  };

  const alignClass =
    align === "center" ? "mx-auto items-center text-center" : "items-start text-left";

  return (
    <div
      className={`mt-4 flex w-full max-w-md flex-col ${alignClass} ${className}`.trim()}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-sm font-semibold text-[#e2e8f0]">
        Discount code ends in:
      </p>
      {display.expired ? (
        <p className="mt-2 text-sm font-medium text-rose-300">
          This welcome offer has ended.
        </p>
      ) : (
        <div
          className={`mt-2 flex flex-wrap items-center gap-2 ${
            align === "center" ? "justify-center" : "justify-start"
          }`}
        >
          <Unit value={String(display.days)} label="Days" />
          <span className="lf-orbitron text-lg font-bold text-emerald-400/70" aria-hidden>
            :
          </span>
          <Unit value={pad2(display.hours)} label="Hours" />
          <span className="lf-orbitron text-lg font-bold text-emerald-400/70" aria-hidden>
            :
          </span>
          <Unit value={pad2(display.minutes)} label="Mins" />
          <span className="lf-orbitron text-lg font-bold text-emerald-400/70" aria-hidden>
            :
          </span>
          <Unit value={pad2(display.seconds)} label="Secs" />
        </div>
      )}
    </div>
  );
}
