import { getAppBaseUrl } from "@/lib/constants/urls";
import type { CampaignInput } from "@/lib/campaign/validate-input";
import { getPricingPlan } from "@/lib/constants/pricing-plans";
import { iyzicoCreateCheckoutForm } from "@/lib/iyzico/client";

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

function checkoutPortalBase(): string {
  const apiBase = (
    process.env.IYZICO_BASE_URL?.trim() || "https://api.iyzipay.com"
  ).toLowerCase();
  if (apiBase.includes("sandbox")) {
    return "https://sandbox-cpp.iyzipay.com";
  }
  return "https://cpp.iyzipay.com";
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

  const result = await iyzicoCreateCheckoutForm({
    locale: "en",
    conversationId,
    price: amount,
    paidPrice: amount,
    currency: "GBP",
    basketId: conversationId,
    paymentGroup: "PRODUCT",
    callbackUrl: `${baseUrl}/api/payments/iyzico/callback`,
    enabledInstallments: [1],
    buyer: {
      id: userId,
      name,
      surname,
      gsmNumber: "+905350000000",
      email,
      identityNumber: "11111111111",
      registrationAddress: `${city}, United Kingdom`,
      city,
      country: "United Kingdom",
      ip: clientIp || "85.34.78.112",
    },
    billingAddress: {
      contactName: `${name} ${surname}`,
      city,
      country: "United Kingdom",
      address: `${city}, United Kingdom`,
    },
    shippingAddress: {
      contactName: `${name} ${surname}`,
      city,
      country: "United Kingdom",
      address: `${city}, United Kingdom`,
    },
    basketItems: [
      {
        id: input.planSlug,
        name: `${plan.name} — first month`,
        category1: "Subscription",
        category2: "AI Visibility",
        itemType: "VIRTUAL",
        price: amount,
      },
    ],
  });

  if (result.status !== "success") {
    const detail = [result.errorCode, result.errorMessage]
      .filter(Boolean)
      .join(": ");
    throw new Error(detail || "iyzico checkout failed");
  }

  if (!result.token) {
    throw new Error("iyzico did not return a checkout token");
  }

  const paymentPageUrl =
    (result.paymentPageUrl && String(result.paymentPageUrl)) ||
    `${checkoutPortalBase()}/?token=${encodeURIComponent(String(result.token))}`;

  return {
    token: String(result.token),
    paymentPageUrl,
  };
}
