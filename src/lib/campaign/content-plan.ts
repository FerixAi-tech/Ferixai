export const BUDGET_TIER_STEP = 10;

export type AggressivenessLevel = "Steady" | "Active" | "Intensive" | "Maximum";

export interface CampaignContentPlan {
  dailyTier: number;
  totalTier: number;
  totalCost: number;
  aggressiveness: AggressivenessLevel;
  siteArticleCount: number;
  blogArticleCount: number;
  devToArticleCount: number;
  boneQuestionDepth: number;
  estimatedContentPieces: number;
}

function getAggressivenessLevel(dailyTier: number): AggressivenessLevel {
  if (dailyTier <= 3) return "Steady";
  if (dailyTier <= 8) return "Active";
  if (dailyTier <= 15) return "Intensive";
  return "Maximum";
}

export function getCampaignContentPlan(
  dailyBudget: number,
  days: number,
): CampaignContentPlan {
  const totalCost = dailyBudget * days;
  const dailyTier = Math.max(1, Math.floor(dailyBudget / BUDGET_TIER_STEP));
  const totalTier = Math.max(1, Math.floor(totalCost / BUDGET_TIER_STEP));

  const siteArticleCount = Math.min(3, 1 + Math.floor(dailyTier / 10));
  const blogArticleCount =
    dailyTier >= 1 ? Math.min(3, 1 + Math.floor(dailyTier / 8)) : 0;
  const devToArticleCount =
    dailyTier >= 2 ? Math.min(2, 1 + Math.floor((dailyTier - 2) / 10)) : 0;

  const boneQuestionDepth = Math.min(15, 3 + Math.floor(totalTier / 6));

  const estimatedContentPieces =
    siteArticleCount + blogArticleCount + devToArticleCount;

  return {
    dailyTier,
    totalTier,
    totalCost,
    aggressiveness: getAggressivenessLevel(dailyTier),
    siteArticleCount,
    blogArticleCount,
    devToArticleCount,
    boneQuestionDepth,
    estimatedContentPieces,
  };
}

/** Kept for compatibility with optional reply tooling; unused without forum. */
export function getReplyOptionsFromPlan(_plan: CampaignContentPlan) {
  return {
    replyMin: 0,
    replyMax: 0,
    delayMs: 0,
    businessNameMentionRate: 0,
  };
}
