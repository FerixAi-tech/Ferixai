"use client";

import type { BillingCycle } from "@/lib/constants/pricing-plans";

export default function BillingCycleToggle({
  value,
  onChange,
  className = "",
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex rounded-xl border border-white/10 bg-[#0e0a18]/80 p-1 ${className}`}
      role="group"
      aria-label="Billing cycle"
    >
      <button
        type="button"
        onClick={() => onChange("monthly")}
        aria-pressed={value === "monthly"}
        className={`min-h-[40px] rounded-lg px-5 py-2 text-sm font-semibold transition ${
          value === "monthly"
            ? "bg-emerald-500/20 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.15)]"
            : "text-[#94a3b8] hover:text-white"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("yearly")}
        aria-pressed={value === "yearly"}
        className={`min-h-[40px] rounded-lg px-5 py-2 text-sm font-semibold transition ${
          value === "yearly"
            ? "bg-emerald-500/20 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.15)]"
            : "text-[#94a3b8] hover:text-white"
        }`}
      >
        Yearly
      </button>
    </div>
  );
}
