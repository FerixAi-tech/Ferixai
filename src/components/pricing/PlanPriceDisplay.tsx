import { formatCurrency } from "@/lib/constants/metrics";

export default function PlanPriceDisplay({
  price,
  compareAtPrice,
  periodLabel,
  savingsAmount,
  size = "lg",
}: {
  price: number;
  compareAtPrice: number;
  periodLabel: string;
  savingsAmount?: number;
  size?: "lg" | "md";
}) {
  const showCompareAt = compareAtPrice > price;
  const showSavings = savingsAmount != null && savingsAmount > 0;
  const priceClass = size === "lg" ? "text-3xl" : "text-2xl";
  const compareClass = size === "lg" ? "text-base sm:text-lg" : "text-sm";

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {showCompareAt ? (
          <p
            className={`${compareClass} mb-1 inline-flex items-center gap-1.5 font-bold text-emerald-300 line-through decoration-emerald-400 decoration-2`}
          >
            <span className="rounded-md border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5">
              {formatCurrency(compareAtPrice)}
              <span className="ml-1 font-semibold text-emerald-200/90">
                /{periodLabel}
              </span>
            </span>
          </p>
        ) : null}
        <p className={`lf-orbitron ${priceClass} font-bold text-white`}>
          {formatCurrency(price)}
          <span
            className={`ml-1 font-semibold text-[#94a3b8] ${size === "lg" ? "text-sm" : "text-xs"}`}
          >
            /{periodLabel}
          </span>
        </p>
      </div>

      {showSavings ? (
        <span className="shrink-0 rounded-lg border border-emerald-400/45 bg-emerald-500/20 px-2.5 py-1.5 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-emerald-100 shadow-[0_0_14px_rgba(16,185,129,0.25)] sm:text-[11px]">
          {formatCurrency(savingsAmount)}
          <span className="block text-[9px] font-semibold tracking-[0.14em] text-emerald-200 sm:text-[10px]">
            off
          </span>
        </span>
      ) : null}
    </div>
  );
}
