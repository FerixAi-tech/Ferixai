import { createAdminClient } from "@/lib/supabase/admin";
import { createCampaignForUser } from "@/lib/campaign/create-campaign";
import {
  validateCampaignInput,
  type CampaignInput,
} from "@/lib/campaign/validate-input";
import { trackPaidPurchaseWithMetaCapi } from "@/lib/payments/meta-purchase";

export type PaymentOrderRow = {
  id: string;
  user_id: string;
  conversation_id: string;
  status: string;
  amount_gbp: number | string;
  currency?: string | null;
  campaign_payload: unknown;
  campaign_slug?: string | null;
  client_ip?: string | null;
  client_user_agent?: string | null;
  meta_fbp?: string | null;
  meta_fbc?: string | null;
};

export type FulfillPaidOrderResult =
  | { status: "paid"; slug: string }
  | { status: "processing" }
  | { status: "already_paid"; slug: string }
  | { status: "failed"; reason: string };

function parseCampaignPayload(raw: unknown): CampaignInput {
  if (raw && typeof raw === "object") {
    return validateCampaignInput(raw);
  }
  return validateCampaignInput({});
}

/**
 * Idempotent fulfillment: creates the campaign once per paid order.
 */
export async function fulfillPaidOrder(
  order: PaymentOrderRow,
  options: {
    stripePaymentIntentId?: string | null;
    baseUrl: string;
  },
): Promise<FulfillPaidOrderResult> {
  const admin = createAdminClient();
  const paymentIntentId = options.stripePaymentIntentId?.trim() || null;

  if (order.status === "paid") {
    const slug = String(order.campaign_slug || "").trim();
    if (slug) {
      return { status: "already_paid", slug };
    }
    return { status: "processing" };
  }

  if (order.status === "processing") {
    return { status: "processing" };
  }

  if (order.status !== "pending") {
    return { status: "failed", reason: `Unexpected order status: ${order.status}` };
  }

  const { data: claimed } = await admin
    .from("payment_orders")
    .update({
      status: "processing",
      stripe_payment_intent_id: paymentIntentId,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (!claimed) {
    const { data: latest } = await admin
      .from("payment_orders")
      .select("status, campaign_slug")
      .eq("id", order.id)
      .maybeSingle();

    const slug = String(latest?.campaign_slug || "").trim();
    if (latest?.status === "paid" && slug) {
      return { status: "already_paid", slug };
    }
    return { status: "processing" };
  }

  try {
    const input = parseCampaignPayload(order.campaign_payload);
    const campaign = await createCampaignForUser(order.user_id, input, {
      deferContent: true,
    });

    await admin
      .from("payment_orders")
      .update({
        status: "paid",
        campaign_slug: campaign.slug,
        stripe_payment_intent_id: paymentIntentId,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "processing");

    await trackPaidPurchaseWithMetaCapi(options.baseUrl, order);

    return { status: "paid", slug: campaign.slug };
  } catch (fulfillmentError) {
    console.error("Campaign fulfillment after Stripe payment failed:", fulfillmentError);

    await admin
      .from("payment_orders")
      .update({
        status: "pending",
        stripe_payment_intent_id: paymentIntentId,
        error_message: String(
          fulfillmentError instanceof Error
            ? fulfillmentError.message
            : "Campaign creation failed after payment",
        ),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "processing");

    return {
      status: "failed",
      reason:
        fulfillmentError instanceof Error
          ? fulfillmentError.message
          : "Campaign creation failed after payment",
    };
  }
}
