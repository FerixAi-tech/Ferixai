import { createAdminClient } from "@/lib/supabase/admin";
import { createCampaignForUser } from "@/lib/campaign/create-campaign";
import type { CampaignInput } from "@/lib/campaign/validate-input";
import { iyzicoRetrieveCheckoutForm } from "@/lib/iyzico/client";
import { getRequestBaseUrl } from "@/lib/constants/urls";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

    const paymentStatus = String(result.paymentStatus || "").toUpperCase();
    const ok =
      result.status === "success" &&
      (paymentStatus === "SUCCESS" ||
        paymentStatus === "SUCCESSFUL" ||
        Boolean(result.paymentId));

    if (!ok) {
      await admin
        .from("payment_orders")
        .update({
          status: "failed",
          error_message: String(
            result.errorMessage || result.paymentStatus || "Payment failed",
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      return NextResponse.redirect(
        `${baseUrl}/dashboard/new?payment=failed`,
      );
    }

    if (order.status === "paid") {
      return NextResponse.redirect(`${baseUrl}/dashboard?payment=ok`);
    }

    // Claim this pending order immediately so iyzico retries cannot
    // create a second campaign / second Meta funnel while OpenAI runs.
    const { data: claimed } = await admin
      .from("payment_orders")
      .update({
        status: "paid",
        iyzico_payment_id: result.paymentId
          ? String(result.paymentId)
          : null,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (!claimed) {
      return NextResponse.redirect(`${baseUrl}/dashboard?payment=ok`);
    }

    const input = order.campaign_payload as CampaignInput;
    const campaign = await createCampaignForUser(order.user_id, input, {
      deferContent: true,
    });

    return NextResponse.redirect(
      `${baseUrl}/dashboard?created=${campaign.slug}&payment=ok`,
    );
  } catch (err) {
    console.error("iyzico callback error:", err);
    return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=error`);
  }
}
