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
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
              result.errorMessage || result.paymentStatus || "Payment not completed",
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

    if (order.status === "paid") {
      return NextResponse.redirect(`${baseUrl}/dashboard?payment=ok`);
    }

    // Another callback is already creating the campaign after iyzico confirmed.
    if (order.status === "processing") {
      return NextResponse.redirect(`${baseUrl}/dashboard?payment=ok`);
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
      // Race: another worker claimed processing/paid meanwhile.
      return NextResponse.redirect(`${baseUrl}/dashboard?payment=ok`);
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

      // Only now is the order "paid" in our system: money confirmed + campaign started.
      await admin
        .from("payment_orders")
        .update({
          status: "paid",
          iyzico_payment_id: String(result.paymentId),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("status", "processing");

      return NextResponse.redirect(
        `${baseUrl}/dashboard?created=${campaign.slug}&payment=ok`,
      );
    } catch (fulfillmentError) {
      console.error("Campaign fulfillment after iyzico payment failed:", fulfillmentError);

      // Release the lock so a later iyzico retry / support retry can fulfill.
      // Money was taken at iyzico; we still must not report "paid" until campaign exists.
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
