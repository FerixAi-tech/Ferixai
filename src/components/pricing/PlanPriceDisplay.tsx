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
  const compareClass = size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {showCompareAt ? (
          <p
            className={`${compareClass} font-semibold text-[#64748b] line-through`}
          >
            {formatCurrency(compareAtPrice)}
            <span className="ml-1 font-medium">/{periodLabel}</span>
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
        <span className="shrink-0 rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1.5 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-emerald-200 sm:text-[11px]">
          {formatCurrency(savingsAmount)}
          <span className="block text-[9px] font-semibold tracking-[0.14em] sm:text-[10px]">
            off
          </span>
        </span>
      ) : null}
    </div>
  );
}
