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
  formatAmount = formatCurrency,
  maxMonthlySavings = MAX_MONTHLY_SAVINGS_AED,
  maxYearlySavings = MAX_YEARLY_SAVINGS_AED,
  showMonthlySavings = true,
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  className?: string;
  formatAmount?: (amount: number) => string;
  maxMonthlySavings?: number;
  maxYearlySavings?: number;
  showMonthlySavings?: boolean;
}) {
  const monthlySelected = value === "monthly";
  const yearlySelected = value === "yearly";

  return (
    <div
      className={`inline-flex rounded-2xl border-2 border-white/20 bg-[#0e0a18] p-1.5 shadow-[0_0_32px_rgba(16,185,129,0.18)] ${className}`}
      role="group"
      aria-label="Billing cycle"
    >
      <button
        type="button"
        onClick={() => onChange("monthly")}
        aria-pressed={monthlySelected}
        className={`relative min-h-[52px] rounded-xl px-5 py-2.5 transition sm:px-6 ${
          monthlySelected
            ? "bg-emerald-500/35 text-white shadow-[0_0_24px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400/60"
            : "text-[#cbd5e1] ring-1 ring-white/10 hover:bg-emerald-500/15 hover:text-white"
        }`}
      >
        <span className="flex flex-col items-center gap-1.5">
          <span className="text-sm font-bold sm:text-base">Monthly</span>
          {showMonthlySavings ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] sm:text-[11px] ${
                monthlySelected
                  ? "bg-emerald-400 text-[#052e1f] shadow-[0_0_14px_rgba(52,211,153,0.55)]"
                  : "bg-emerald-500/90 text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]"
              }`}
            >
              Save up to {formatAmount(maxMonthlySavings)}
            </span>
          ) : null}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange("yearly")}
        aria-pressed={yearlySelected}
        className={`relative min-h-[52px] rounded-xl px-5 py-2.5 transition sm:px-6 ${
          yearlySelected
            ? "bg-emerald-500/35 text-white shadow-[0_0_24px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400/60"
            : "text-[#cbd5e1] ring-1 ring-white/10 hover:bg-emerald-500/15 hover:text-white"
        }`}
      >
        <span className="flex flex-col items-center gap-1.5">
          <span className="text-sm font-bold sm:text-base">Yearly</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] sm:text-[11px] ${
              yearlySelected
                ? "bg-emerald-400 text-[#052e1f] shadow-[0_0_14px_rgba(52,211,153,0.55)]"
                : "animate-pulse bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.45)]"
            }`}
          >
            Save up to {formatAmount(maxYearlySavings)}
          </span>
        </span>
      </button>
    </div>
  );
}
