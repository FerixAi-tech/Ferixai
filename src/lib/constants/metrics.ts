import type { VisibilityMetrics } from "@/lib/types";
import type { PricingPlan } from "@/lib/constants/pricing-plans";
import { BILLING_CYCLE_DAYS } from "@/lib/constants/pricing-plans";

export {
  BUDGET_TIER_STEP,
  getCampaignContentPlan,
  getCampaignContentPlanForPlan,
  getReplyOptionsFromPlan,
} from "@/lib/campaign/content-plan";
export type {
  AggressivenessLevel,
  CampaignContentPlan,
} from "@/lib/campaign/content-plan";

/** @deprecated Slider limits — kept for legacy drafts only. */
export const BUDGET_MIN = 10;
export const BUDGET_MAX = 250;
export const DAYS_MIN = 1;
export const DAYS_MAX = 30;

/** @deprecated Prefer calculateVisibilityMetricsForPlan. */
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

export function calculateVisibilityMetricsForPlan(
  plan: PricingPlan,
  payableTotal: number,
): VisibilityMetrics {
  const intensity = Math.min(
    100,
    Math.round(30 + plan.intensityScore * 18 + BILLING_CYCLE_DAYS * 0.5),
  );
  const estimatedReach = Math.round(
    payableTotal * 12 + plan.intensityScore * 1800,
  );
  const llmMentions = Math.round(
    payableTotal / 25 + plan.intensityScore * 4 + BILLING_CYCLE_DAYS / 5,
  );
  const contentScore = Math.min(99, Math.round(50 + plan.intensityScore * 10));

  return {
    totalCost: payableTotal,
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
