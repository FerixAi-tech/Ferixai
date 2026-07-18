import type { VisibilityMetrics } from "@/lib/types";

export {
  BUDGET_TIER_STEP,
  getCampaignContentPlan,
  getReplyOptionsFromPlan,
} from "@/lib/campaign/content-plan";
export type {
  AggressivenessLevel,
  CampaignContentPlan,
} from "@/lib/campaign/content-plan";

export const BUDGET_MIN = 10;
export const BUDGET_MAX = 250;
export const DAYS_MIN = 1;
export const DAYS_MAX = 30;

/** Planning figures for content intensity — not measured AI mention forecasts. */
export function calculateVisibilityMetrics(
  dailyBudget: number,
  days: number,
): VisibilityMetrics {
  const totalCost = dailyBudget * days;
  const intensity = Math.min(100, Math.round(25 + dailyBudget * 0.25 + days));
  const estimatedReach = Math.round(totalCost * 8 + intensity * 40);
  const llmMentions = Math.round(totalCost / 40 + days);
  const contentScore = Math.min(99, Math.round(45 + intensity * 0.4));

  return {
    totalCost,
    visibilityIncrease: intensity,
    estimatedReach,
    llmMentions,
    contentScore,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}
