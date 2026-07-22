import { createClient } from "@/lib/supabase/server";
import { createCampaignForUser } from "@/lib/campaign/create-campaign";
import {
  isPaymentBypassEnabled,
  isPaymentRequired,
  validateCampaignInput,
} from "@/lib/campaign/validate-input";
import { getCampaignContentPlanForPlan } from "@/lib/constants/metrics";
import { getPricingPlan } from "@/lib/constants/pricing-plans";
import { NextResponse } from "next/server";

export const maxDuration = 120;
export const runtime = "nodejs";

/**
 * Direct campaign create — only allowed when payment bypass is explicitly
 * enabled (FERIXAI_PAYMENT_REQUIRED=false) or the payable amount is £0.
 * Paid launches must go through /api/payments/iyzico/initialize.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await request.json();
    const input = validateCampaignInput(body);

    if (isPaymentRequired(input.totalCostGbp)) {
      return NextResponse.json(
        {
          error:
            "Payment is required. Use the iyzico checkout flow to launch this campaign.",
        },
        { status: 402 },
      );
    }

    if (!isPaymentBypassEnabled() && input.totalCostGbp > 0) {
      return NextResponse.json(
        { error: "Payment is required to launch a campaign" },
        { status: 402 },
      );
    }

    const pricingPlan = getPricingPlan(input.planSlug);
    const contentPlan = getCampaignContentPlanForPlan(
      pricingPlan,
      input.totalCostGbp,
    );
    const result = await createCampaignForUser(user.id, input);

    return NextResponse.json({
      success: true,
      campaignId: result.campaignId,
      slug: result.slug,
      title: result.title,
      contentUrl: result.contentUrl,
      wordpressUrl: result.wordpressUrl,
      devtoUrl: result.devtoUrl,
      contentPlan: {
        aggressiveness: contentPlan.aggressiveness,
        estimatedContentPieces: contentPlan.estimatedContentPieces,
        siteArticleCount: contentPlan.siteArticleCount,
        blogArticleCount: contentPlan.blogArticleCount,
        devToArticleCount: contentPlan.devToArticleCount,
      },
    });
  } catch (err) {
    console.error("Campaign creation error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not create campaign",
      },
      { status: 500 },
    );
  }
}
