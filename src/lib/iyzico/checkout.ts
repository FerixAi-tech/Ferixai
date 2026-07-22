import { getAppBaseUrl } from "@/lib/constants/urls";
import type { CampaignInput } from "@/lib/campaign/validate-input";
import { getPricingPlan } from "@/lib/constants/pricing-plans";
import {
  getIyzicoClient,
  iyzicoCreateCheckoutForm,
  Iyzipay,
} from "@/lib/iyzico/client";

function splitName(fullName: string | null | undefined, email: string) {
  const cleaned = (fullName || "").trim();
  if (!cleaned) {
    const local = email.split("@")[0] || "Customer";
    return { name: local, surname: "User" };
  }
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return { name: parts[0]!, surname: "User" };
  return {
    name: parts[0]!,
    surname: parts.slice(1).join(" "),
  };
}

export async function initializeIyzicoCheckout(options: {
  userId: string;
  email: string;
  fullName?: string | null;
  input: CampaignInput;
  conversationId: string;
  clientIp?: string;
}): Promise<{ token: string; paymentPageUrl: string }> {
  const { userId, email, fullName, input, conversationId, clientIp } = options;
  const plan = getPricingPlan(input.planSlug);
  const amount = input.totalCostGbp.toFixed(2);
  const { name, surname } = splitName(fullName, email);
  const baseUrl = getAppBaseUrl();
  const city = input.city || "London";

  const iyzipay = getIyzicoClient();

  const result = await iyzicoCreateCheckoutForm(iyzipay, {
    locale: Iyzipay.LOCALE.EN,
    conversationId,
    price: amount,
    paidPrice: amount,
    currency: Iyzipay.CURRENCY.GBP,
    basketId: conversationId,
    paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    callbackUrl: `${baseUrl}/api/payments/iyzico/callback`,
    enabledInstallments: [1],
    buyer: {
      id: userId,
      name,
      surname,
      gsmNumber: "+905350000000",
      email,
      identityNumber: "11111111111",
      registrationAddress: city,
      city,
      country: "United Kingdom",
      ip: clientIp || "85.34.78.112",
    },
    billingAddress: {
      contactName: `${name} ${surname}`,
      city,
      country: "United Kingdom",
      address: city,
    },
    shippingAddress: {
      contactName: `${name} ${surname}`,
      city,
      country: "United Kingdom",
      address: city,
    },
    basketItems: [
      {
        id: input.planSlug,
        name: `${plan.name} — first month`,
        category1: "Subscription",
        category2: "AI Visibility",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: amount,
      },
    ],
  });

  if (result.status !== "success" || !result.token || !result.paymentPageUrl) {
    throw new Error(
      String(result.errorMessage || "Could not start iyzico checkout"),
    );
  }

  return {
    token: String(result.token),
    paymentPageUrl: String(result.paymentPageUrl),
  };
}
