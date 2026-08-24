import { getAppBaseUrl } from "@/lib/constants/urls";
import type { CampaignInput } from "@/lib/campaign/validate-input";
import { getCheckoutCharge } from "@/lib/constants/checkout";
import { getPricingPlan } from "@/lib/constants/pricing-plans";
import { getStripe } from "@/lib/stripe/server";

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
  const baseUrl = getAppBaseUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    customer_email: email,
    client_reference_id: conversationId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: charge.currency.toLowerCase(),
          unit_amount: Math.round(charge.amount * 100),
          product_data: {
            name: `${plan.name} — FerixAI monthly plan`,
            description:
              "AI visibility indexing across ChatGPT, Gemini & Claude for your business.",
          },
        },
      },
    ],
    metadata: {
      order_id: orderId,
      user_id: userId,
      conversation_id: conversationId,
      plan_slug: input.planSlug,
    },
    return_url: `${baseUrl}/api/payments/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.client_secret || !session.id) {
    throw new Error("Stripe did not return an embedded checkout session");
  }

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
  };
}
