import { createAdminClient } from "@/lib/supabase/admin";
import {
  fulfillPaidOrder,
  type PaymentOrderRow,
} from "@/lib/payments/fulfill-paid-order";
import { getAppBaseUrl } from "@/lib/constants/urls";
import { CHECKOUT_CURRENCY } from "@/lib/constants/checkout";
import { getStripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function paymentOkUrl(baseUrl: string, slug: string): string {
  return `${baseUrl}/dashboard?created=${encodeURIComponent(slug)}&payment=ok`;
}

function paymentProcessingUrl(baseUrl: string): string {
  return `${baseUrl}/dashboard?payment=processing`;
}

export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl();

  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id")?.trim();

    if (!sessionId) {
      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=missing_session`);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=failed`);
    }

    const sessionCurrency = session.currency?.toLowerCase();
    if (sessionCurrency && sessionCurrency !== CHECKOUT_CURRENCY.toLowerCase()) {
      console.error(
        "Stripe success: unexpected session currency",
        sessionCurrency,
        sessionId,
      );
      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=failed`);
    }

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("payment_orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (!order) {
      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=order_not_found`);
    }

    const metadataOrderId = session.metadata?.order_id;
    if (metadataOrderId && metadataOrderId !== order.id) {
      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=failed`);
    }

    const expectedAmount = Number(order.amount_gbp);
    const paidAmount = (session.amount_total ?? 0) / 100;
    if (
      Number.isFinite(expectedAmount) &&
      expectedAmount > 0 &&
      Math.abs(paidAmount - expectedAmount) >= 0.011
    ) {
      return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=failed`);
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const result = await fulfillPaidOrder(order as PaymentOrderRow, {
      stripePaymentIntentId: paymentIntentId,
      baseUrl,
    });

    if (result.status === "paid" || result.status === "already_paid") {
      return NextResponse.redirect(paymentOkUrl(baseUrl, result.slug));
    }

    if (result.status === "processing") {
      return NextResponse.redirect(paymentProcessingUrl(baseUrl));
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=error`);
  } catch (err) {
    console.error("Stripe success redirect error:", err);
    return NextResponse.redirect(`${baseUrl}/dashboard/new?payment=error`);
  }
}
