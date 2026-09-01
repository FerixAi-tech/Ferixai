"use client";

import { useEffect, useState } from "react";
import { AUDIT_SCAN_DURATION_MS, AUDIT_SCAN_STEPS } from "@/lib/constants/audit-sectors";

export default function AuditTerminalLoader() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = AUDIT_SCAN_STEPS.map((step, index) =>
      window.setTimeout(() => setVisibleCount(index + 1), step.delayMs),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div className="mt-6 rounded-xl border border-emerald-500/25 bg-[#05070c]/90 p-4 font-mono text-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        Deep LLM Scan
      </div>
      <ul className="space-y-2.5">
        {AUDIT_SCAN_STEPS.map((step, index) => {
          const visible = index < visibleCount;
          const toneClass =
            step.tone === "ok"
              ? "text-emerald-300"
              : step.tone === "warn"
                ? "text-amber-300"
                : "text-red-300";

          return (
            <li
              key={step.text}
              className={`transition-opacity duration-300 ${
                visible ? "opacity-100" : "opacity-0"
              } ${toneClass}`}
            >
              {step.tone === "ok" ? "🟢" : step.tone === "warn" ? "🟡" : "🔴"}{" "}
              <span className="italic">{step.text}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-950/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400 transition-all ease-linear"
          style={{
            width: `${Math.min(100, (visibleCount / AUDIT_SCAN_STEPS.length) * 100)}%`,
            transitionDuration: `${AUDIT_SCAN_DURATION_MS}ms`,
          }}
        />
      </div>
    </div>
  );
}
