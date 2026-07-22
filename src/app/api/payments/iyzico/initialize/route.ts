import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isPaymentBypassEnabled,
  validateCampaignInput,
} from "@/lib/campaign/validate-input";
import { createCampaignForUser } from "@/lib/campaign/create-campaign";
import { initializeIyzicoCheckout } from "@/lib/iyzico/checkout";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

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

    // Free first month (fully covered by promo) — skip payment
    if (input.totalCostGbp <= 0 || isPaymentBypassEnabled()) {
      const result = await createCampaignForUser(user.id, input);
      return NextResponse.json({
        success: true,
        paid: false,
        campaignId: result.campaignId,
        slug: result.slug,
      });
    }

    const conversationId = `fx-${randomUUID()}`;
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const { error: insertError } = await admin.from("payment_orders").insert({
      user_id: user.id,
      conversation_id: conversationId,
      plan_slug: input.planSlug,
      amount_gbp: input.totalCostGbp,
      currency: "GBP",
      status: "pending",
      campaign_payload: input,
    });

    if (insertError) {
      throw new Error(insertError.message || "Could not create payment order");
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const clientIp =
      forwarded?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    const checkout = await initializeIyzicoCheckout({
      userId: user.id,
      email: profile?.email || user.email || "",
      fullName: profile?.full_name,
      input,
      conversationId,
      clientIp: clientIp || undefined,
    });

    await admin
      .from("payment_orders")
      .update({
        iyzico_token: checkout.token,
        updated_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId);

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      paymentPageUrl: checkout.paymentPageUrl,
      token: checkout.token,
    });
  } catch (err) {
    console.error("iyzico initialize error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not start payment",
      },
      { status: 500 },
    );
  }
}
