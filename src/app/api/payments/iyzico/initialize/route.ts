import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isIyzicoConfigured,
  isPaymentRequired,
  validateCampaignInput,
} from "@/lib/campaign/validate-input";
import { createCampaignForUser } from "@/lib/campaign/create-campaign";
import { assertPromoCodeAvailable } from "@/lib/promo/codes";
import { getIyzicoCheckoutCharge } from "@/lib/constants/checkout";
import { initializeIyzicoCheckout } from "@/lib/iyzico/checkout";
import {
  getClientIpFromHeaders,
  parseMetaCookies,
} from "@/lib/meta/capi";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function asOptionalCookie(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 512) : null;
}

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
    const cookieHeader = request.headers.get("cookie");
    const fromCookies = parseMetaCookies(cookieHeader);
    const metaFbp =
      asOptionalCookie(body.fbp) || asOptionalCookie(fromCookies.fbp);
    const metaFbc =
      asOptionalCookie(body.fbc) || asOptionalCookie(fromCookies.fbc);
    const clientIp = getClientIpFromHeaders(request.headers) || null;
    const clientUserAgent =
      request.headers.get("user-agent")?.trim().slice(0, 512) || null;

    if (input.promoApplied && input.promoCode) {
      await assertPromoCodeAvailable(input.promoCode);
    }

    // Only fully free first-month (or explicit FERIXAI_PAYMENT_REQUIRED=false) skips checkout
    if (!isPaymentRequired(input.totalCostGbp)) {
      const result = await createCampaignForUser(user.id, input);
      return NextResponse.json({
        success: true,
        paid: false,
        requiresPayment: false,
        campaignId: result.campaignId,
        slug: result.slug,
      });
    }

    if (!isIyzicoConfigured()) {
      return NextResponse.json(
        {
          error:
            "Payment is required but iyzico is not configured. Set IYZICO_API_KEY and IYZICO_SECRET_KEY.",
        },
        { status: 503 },
      );
    }

    const conversationId = `fx-${randomUUID()}`;
    const admin = createAdminClient();
    const charge = getIyzicoCheckoutCharge(input.totalCostGbp);

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const email = profile?.email || user.email || "";
    if (!email) {
      return NextResponse.json(
        { error: "Account email is required for payment." },
        { status: 400 },
      );
    }

    const { error: insertError } = await admin.from("payment_orders").insert({
      user_id: user.id,
      conversation_id: conversationId,
      plan_slug: input.planSlug,
      amount_gbp: charge.amount,
      currency: charge.currency,
      status: "pending",
      campaign_payload: input,
      client_ip: clientIp,
      client_user_agent: clientUserAgent,
      meta_fbp: metaFbp,
      meta_fbc: metaFbc,
    });

    if (insertError) {
      throw new Error(insertError.message || "Could not create payment order");
    }

    let checkout: { token: string; paymentPageUrl: string };
    try {
      checkout = await initializeIyzicoCheckout({
        userId: user.id,
        email,
        fullName: profile?.full_name,
        input,
        conversationId,
        clientIp: clientIp || undefined,
      });
    } catch (checkoutErr) {
      await admin
        .from("payment_orders")
        .update({
          status: "failed",
          error_message:
            checkoutErr instanceof Error
              ? checkoutErr.message
              : "Checkout init failed",
          updated_at: new Date().toISOString(),
        })
        .eq("conversation_id", conversationId);
      throw checkoutErr;
    }

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
      amountGbp: input.totalCostGbp,
      chargedAmount: charge.amount,
      chargedCurrency: charge.currency,
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
