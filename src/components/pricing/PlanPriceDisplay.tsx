import { formatCurrency } from "@/lib/constants/metrics";

export default function PlanPriceDisplay({
  price,
  compareAtPrice,
  periodLabel,
  size = "lg",
}: {
  price: number;
  compareAtPrice: number;
  periodLabel: string;
  size?: "lg" | "md";
}) {
  const showCompareAt = compareAtPrice > price;
  const priceClass =
    size === "lg" ? "text-3xl" : "text-2xl";
  const compareClass =
    size === "lg" ? "text-sm" : "text-xs";

  return (
    <div>
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
  );
}
