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
      className={`inline-flex w-full max-w-lg rounded-2xl border-2 border-white/20 bg-[#0e0a18] p-1.5 shadow-[0_0_32px_rgba(139,92,246,0.18)] sm:w-auto ${className}`}
      role="group"
      aria-label="Pricing audience"
    >
      <button
        type="button"
        onClick={() => onChange("business")}
        aria-pressed={businessSelected}
        className={`min-h-[52px] flex-1 rounded-xl px-5 py-3 text-sm font-bold transition sm:px-6 sm:text-base ${
          businessSelected
            ? "bg-violet-500/35 text-white shadow-[0_0_24px_rgba(139,92,246,0.45)] ring-2 ring-violet-400/60"
            : "text-[#cbd5e1] ring-1 ring-white/10 hover:bg-violet-500/15 hover:text-white"
        }`}
      >
        Business
      </button>
      <button
        type="button"
        onClick={() => onChange("agency")}
        aria-pressed={agencySelected}
        className={`min-h-[52px] flex-1 rounded-xl px-5 py-3 text-sm font-bold transition sm:px-6 sm:text-base ${
          agencySelected
            ? "bg-teal-500/35 text-white shadow-[0_0_24px_rgba(20,184,166,0.45)] ring-2 ring-teal-400/60"
            : "text-[#cbd5e1] ring-1 ring-white/10 hover:bg-teal-500/15 hover:text-white"
        }`}
      >
        Agency / Freelancer
      </button>
    </div>
  );
}
