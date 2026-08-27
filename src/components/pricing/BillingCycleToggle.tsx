"use client";

import {
  MAX_MONTHLY_SAVINGS_AED,
  MAX_YEARLY_SAVINGS_AED,
  type BillingCycle,
} from "@/lib/constants/pricing-plans";
import { formatCurrency } from "@/lib/constants/metrics";

export default function BillingCycleToggle({
  value,
  onChange,
  className = "",
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  className?: string;
}) {
  const monthlySelected = value === "monthly";
  const yearlySelected = value === "yearly";

  return (
    <div
      className={`inline-flex rounded-xl border border-white/10 bg-[#0e0a18]/80 p-1 ${className}`}
      role="group"
      aria-label="Billing cycle"
    >
      <button
        type="button"
        onClick={() => onChange("monthly")}
        aria-pressed={monthlySelected}
        className={`relative min-h-[44px] rounded-lg px-4 py-2 transition sm:px-5 ${
          monthlySelected
            ? "bg-emerald-500/25 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.28)] ring-1 ring-emerald-400/40"
            : "text-[#94a3b8] ring-1 ring-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-100"
        }`}
      >
        <span className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold">Monthly</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] sm:text-[10px] ${
              monthlySelected
                ? "bg-emerald-400 text-[#052e1f] shadow-[0_0_14px_rgba(52,211,153,0.55)]"
                : "bg-emerald-500/90 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]"
            }`}
          >
            Save up to {formatCurrency(MAX_MONTHLY_SAVINGS_AED)}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("yearly")}
        aria-pressed={yearlySelected}
        className={`relative min-h-[44px] rounded-lg px-4 py-2 transition sm:px-5 ${
          yearlySelected
            ? "bg-emerald-500/25 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.28)] ring-1 ring-emerald-400/40"
            : "text-[#94a3b8] ring-1 ring-emerald-500/25 hover:bg-emerald-500/10 hover:text-emerald-100"
        }`}
      >
        <span className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold">Yearly</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] sm:text-[10px] ${
              yearlySelected
                ? "bg-emerald-400 text-[#052e1f] shadow-[0_0_14px_rgba(52,211,153,0.55)]"
                : "animate-pulse bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.45)]"
            }`}
          >
            Save up to {formatCurrency(MAX_YEARLY_SAVINGS_AED)}
          </span>
        </span>
      </button>
    </div>
  );
}
