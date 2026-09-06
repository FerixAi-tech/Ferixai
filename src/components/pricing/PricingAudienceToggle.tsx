"use client";

export type PricingAudience = "business" | "agency";

export default function PricingAudienceToggle({
  value,
  onChange,
  className = "",
}: {
  value: PricingAudience;
  onChange: (audience: PricingAudience) => void;
  className?: string;
}) {
  const businessSelected = value === "business";
  const agencySelected = value === "agency";

  return (
    <div
      className={`inline-flex w-full max-w-md rounded-xl border border-white/10 bg-[#0e0a18]/80 p-1 sm:w-auto ${className}`}
      role="group"
      aria-label="Pricing audience"
    >
      <button
        type="button"
        onClick={() => onChange("business")}
        aria-pressed={businessSelected}
        className={`min-h-[44px] flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${
          businessSelected
            ? "bg-violet-500/25 text-violet-100 shadow-[0_0_20px_rgba(139,92,246,0.28)] ring-1 ring-violet-400/40"
            : "text-[#94a3b8] hover:bg-violet-500/10 hover:text-violet-100"
        }`}
      >
        Business
      </button>
      <button
        type="button"
        onClick={() => onChange("agency")}
        aria-pressed={agencySelected}
        className={`min-h-[44px] flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${
          agencySelected
            ? "bg-teal-500/25 text-teal-100 shadow-[0_0_20px_rgba(20,184,166,0.28)] ring-1 ring-teal-400/40"
            : "text-[#94a3b8] hover:bg-teal-500/10 hover:text-teal-100"
        }`}
      >
        Agency / Freelancer
      </button>
    </div>
  );
}
