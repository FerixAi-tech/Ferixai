import { getAppBaseUrl } from "@/lib/constants/urls";
import type { CampaignInput } from "@/lib/campaign/validate-input";
import { getCheckoutCharge, CHECKOUT_CURRENCY } from "@/lib/constants/checkout";
import { getPricingPlan } from "@/lib/constants/pricing-plans";
import { getStripe } from "@/lib/stripe/server";
import { ensurePaymentMethodDomains } from "@/lib/stripe/payment-method-domains";
import { checkoutSessionPaymentMethodTypes } from "@/lib/stripe/payment-methods";

export async function createStripeCheckoutSession(options: {
  userId: string;
  email: string;
  input: CampaignInput;
  conversationId: string;
  orderId: string;
}): Promise<{ sessionId: string; clientSecret: string }> {
  const { userId, email, input, conversationId, orderId } = options;
  const plan = getPricingPlan(input.planSlug);
  const charge = getCheckoutCharge(input.totalCostGbp);
  const currency = charge.currency.toLowerCase();
  const baseUrl = getAppBaseUrl();
  const stripe = getStripe();
  await ensurePaymentMethodDomains(stripe);

  const session = await stripe.checkout.sessions.create({
    ui_mode: "elements",
    mode: "payment",
    locale: "auto",
    currency,
    adaptive_pricing: { enabled: false },
    billing_address_collection: "auto",
    payment_method_types: [...checkoutSessionPaymentMethodTypes],
    customer_email: email,
    client_reference_id: conversationId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.round(charge.amount * 100),
          product_data: {
            name: `${plan.name} — FerixAI ${input.billingCycle} plan`,
            description:
              "AI visibility indexing across ChatGPT, Gemini & Claude for your business.",
          },
        },
      },
    ],
    payment_intent_data: {
      metadata: {
        order_id: orderId,
        charge_currency: CHECKOUT_CURRENCY,
      },
    },
    metadata: {
      order_id: orderId,
      user_id: userId,
      conversation_id: conversationId,
      plan_slug: input.planSlug,
      charge_currency: CHECKOUT_CURRENCY,
    },
    return_url: `${baseUrl}/api/payments/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.client_secret || !session.id) {
    throw new Error("Stripe did not return a checkout session client secret");
  }

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
  };
}
