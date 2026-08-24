import { createAdminClient } from "@/lib/supabase/admin";
import {
  fulfillPaidOrder,
  type PaymentOrderRow,
} from "@/lib/payments/fulfill-paid-order";
import { getAppBaseUrl } from "@/lib/constants/urls";
import { getStripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const sessionId = session.id;
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("payment_orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (!order) {
    console.error("Stripe webhook: order not found for session", sessionId);
    return NextResponse.json({ received: true });
  }

  const baseUrl = getAppBaseUrl();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await fulfillPaidOrder(order as PaymentOrderRow, {
    stripePaymentIntentId: paymentIntentId,
    baseUrl,
  });

  return NextResponse.json({ received: true });
}
