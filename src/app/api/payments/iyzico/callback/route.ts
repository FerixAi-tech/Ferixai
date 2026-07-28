import { createAdminClient } from "@/lib/supabase/admin";
import { createCampaignForUser } from "@/lib/campaign/create-campaign";
import {
  validateCampaignInput,
  type CampaignInput,
} from "@/lib/campaign/validate-input";
import {
  isIyzicoPaymentCollected,
  iyzicoRetrieveCheckoutForm,
} from "@/lib/iyzico/client";
import { getRequestBaseUrl } from "@/lib/constants/urls";
import { sendMetaCAPIEvent } from "@/lib/meta/capi";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function trackPaidPurchaseWithMetaCapi(
  baseUrl: string,
  order: {
    id: string;
    user_id: string;
    amount_gbp: number | string;
    currency?: string | null;
    client_ip?: string | null;
    client_user_agent?: string | null;
    meta_fbp?: string | null;
    meta_fbc?: string | null;
  },
): Promise<void> {
  try {
    const admin = createAdminClient();
    const [{ data: profile }, authUserResult] = await Promise.all([
      admin
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .maybeSingle(),
      admin.auth.admin.getUserById(order.user_id),
    ]);

    const authUser = authUserResult.data.user;
    const email = profile?.email || authUser?.email || null;
    const phone = authUser?.phone || null;
    const amount = Number(order.amount_gbp);

    if (!(amount > 0)) return;

    const result = await sendMetaCAPIEvent({
      eventName: "Purchase",
      eventId: order.id,
      value: amount,
      currency: order.currency || "GBP",
      contentName: "FerixAI Subscription",
      eventSourceUrl: `${baseUrl}/dashboard`,
      email,
      phone,
      ip: order.client_ip,
      userAgent: order.client_user_agent,
      fbp: order.meta_fbp,
      fbc: order.meta_fbc,
    });

    if (!result.ok && !result.skipped) {
      console.error("Meta CAPI Purchase failed:", result.error);
    }
  } catch (err) {
    console.error("Meta CAPI Purchase error:", err);
  }
}

function amountsMatch(
  paidPrice: string | number | undefined,
  expectedAmount: number,
): boolean {
  if (paidPrice === undefined || paidPrice === null || paidPrice === "") {
    // Some iyzico responses omit paidPrice; paymentStatus + paymentId still gate us.
    return true;
  }
  const paid = Number.parseFloat(String(paidPrice));
  if (!Number.isFinite(paid)) return false;
  return Math.abs(paid - expectedAmount) < 0.011;
}

function paymentOkUrl(baseUrl: string, slug: string): string {
  return `${baseUrl}/dashboard?created=${encodeURIComponent(slug)}&payment=ok`;
}

function paymentProcessingUrl(baseUrl: string): string {
  return `${baseUrl}/dashboard?payment=processing`;
}

export async function POST(request: Request) {
  const baseUrl = getRequestBaseUrl(request);

  try {
    const form = await request.formData();
    const token = String(form.get("token") || "").trim();

    if (!token) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/new?payment=missing_token`,
      );
    }

    const result = await iyzicoRetrieveCheckoutForm({
      locale: "en",
      token,
    });

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("payment_orders")
      .select("*")
      .eq("iyzico_token", token)
      .maybeSingle();

    if (!order) {
      return NextResponse.redirect(
        `${baseUrl}/dashboard/new?payment=order_not_found`,
      );
    }

    // Never mark the order paid / start a campaign unless iyzico confirms collection.
    if (!isIyzicoPaymentCollected(result)) {
      // Do not overwrite an in-flight / completed fulfillment with "failed"
      // when a later retrieve is still pending or incomplete.
      if (order.status === "pending") {
        await admin
          .from("payment_orders")
          .update({
            status: "failed",
            error_message: String(
              result.errorMessage ||
                result.paymentStatus ||
                "Payment not completed",
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id)
          .eq("status", "pending");
      }

      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=failed`);
    }

    if (
      result.conversationId &&
      String(result.conversationId) !== String(order.conversation_id)
    ) {
      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=failed`);
    }

    if (!amountsMatch(result.paidPrice, Number(order.amount_gbp))) {
      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=failed`);
    }

    // Already fulfilled — only report success when we have a campaign slug.
    if (order.status === "paid") {
      const slug = String(order.campaign_slug || "").trim();
      if (slug) {
        return NextResponse.redirect(paymentOkUrl(baseUrl, slug));
      }
      return NextResponse.redirect(paymentProcessingUrl(baseUrl));
    }

    // Another callback is creating the campaign — not success yet.
    if (order.status === "processing") {
      return NextResponse.redirect(paymentProcessingUrl(baseUrl));
    }

    // Lock the order only after iyzico confirmed collection — not before.
    const { data: claimed } = await admin
      .from("payment_orders")
      .update({
        status: "processing",
        iyzico_payment_id: String(result.paymentId),
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (!claimed) {
      // Race: another worker claimed processing/paid — wait, don't claim success.
      return NextResponse.redirect(paymentProcessingUrl(baseUrl));
    }

    try {
      const rawPayload = order.campaign_payload;
      const input: CampaignInput =
        rawPayload && typeof rawPayload === "object"
          ? validateCampaignInput(rawPayload)
          : validateCampaignInput({});

      const campaign = await createCampaignForUser(order.user_id, input, {
        deferContent: true,
      });

      // Only now: money confirmed + campaign started → paid + payment=ok.
      await admin
        .from("payment_orders")
        .update({
          status: "paid",
          campaign_slug: campaign.slug,
          iyzico_payment_id: String(result.paymentId),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("status", "processing");

      await trackPaidPurchaseWithMetaCapi(baseUrl, order);

      return NextResponse.redirect(paymentOkUrl(baseUrl, campaign.slug));
    } catch (fulfillmentError) {
      console.error(
        "Campaign fulfillment after iyzico payment failed:",
        fulfillmentError,
      );

      // Release the lock so a later iyzico retry / support retry can fulfill.
      await admin
        .from("payment_orders")
        .update({
          status: "pending",
          iyzico_payment_id: String(result.paymentId),
          error_message: String(
            fulfillmentError instanceof Error
              ? fulfillmentError.message
              : "Campaign creation failed after payment",
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("status", "processing");

      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=error`);
    }
  } catch (err) {
    console.error("iyzico callback error:", err);
    return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=error`);
  }
}
