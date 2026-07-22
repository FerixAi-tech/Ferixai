import { createHmac, randomBytes } from "crypto";

export type IyzicoResult = {
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
  paymentStatus?: string;
  paymentId?: string | number;
  conversationId?: string;
};

function getConfig() {
  const apiKey = process.env.IYZICO_API_KEY?.trim();
  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();
  const baseUrl = (
    process.env.IYZICO_BASE_URL?.trim() || "https://api.iyzipay.com"
  ).replace(/\/$/, "");

  if (!apiKey || !secretKey) {
    throw new Error("iyzico is not configured (missing API keys)");
  }

  return { apiKey, secretKey, baseUrl };
}

function formatPrice(price: string | number): string {
  const n = typeof price === "number" ? price : parseFloat(price);
  if (!Number.isFinite(n)) return String(price);
  const s = String(n);
  return s.includes(".") ? s : `${s}.0`;
}

function deepFormatPrices(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepFormatPrices);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (
        (k === "price" || k === "paidPrice") &&
        (typeof v === "string" || typeof v === "number")
      ) {
        out[k] = formatPrice(v);
      } else {
        out[k] = deepFormatPrices(v);
      }
    }
    return out;
  }
  return value;
}

function authorizationHeader(
  apiKey: string,
  secretKey: string,
  uriPath: string,
  body: Record<string, unknown>,
): { authorization: string; randomKey: string } {
  const randomKey = `${Date.now()}${randomBytes(8).toString("hex")}`;
  const payload = JSON.stringify(body);
  const signature = createHmac("sha256", secretKey)
    .update(randomKey + uriPath + payload)
    .digest("hex");

  const authorizationParams = [
    `apiKey:${apiKey}`,
    `randomKey:${randomKey}`,
    `signature:${signature}`,
  ].join("&");

  return {
    authorization: `IYZWSv2 ${Buffer.from(authorizationParams).toString("base64")}`,
    randomKey,
  };
}

async function iyzicoRequest(
  uriPath: string,
  body: Record<string, unknown>,
): Promise<IyzicoResult> {
  const { apiKey, secretKey, baseUrl } = getConfig();
  const formattedBody = deepFormatPrices(body) as Record<string, unknown>;
  const { authorization } = authorizationHeader(
    apiKey,
    secretKey,
    uriPath,
    formattedBody,
  );

  const response = await fetch(`${baseUrl}${uriPath}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(formattedBody),
  });

  const data = (await response.json().catch(() => ({}))) as IyzicoResult;
  return data;
}

export async function iyzicoCreateCheckoutForm(
  request: Record<string, unknown>,
): Promise<IyzicoResult> {
  return iyzicoRequest(
    "/payment/iyzipos/checkoutform/initialize/auth/ecom",
    request,
  );
}

export async function iyzicoRetrieveCheckoutForm(options: {
  locale?: string;
  token: string;
  conversationId?: string;
}): Promise<IyzicoResult> {
  return iyzicoRequest("/payment/iyzipos/checkoutform/auth/ecom/detail", {
    locale: options.locale || "en",
    token: options.token,
    conversationId: options.conversationId,
  });
}
