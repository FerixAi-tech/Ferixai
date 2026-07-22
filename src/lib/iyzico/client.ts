import Iyzipay from "iyzipay";

type IyzicoResult = {
  status?: string;
  errorMessage?: string;
  token?: string;
  paymentPageUrl?: string;
  paymentStatus?: string;
  paymentId?: string | number;
  [key: string]: unknown;
};

export function getIyzicoClient() {
  const apiKey = process.env.IYZICO_API_KEY?.trim();
  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();
  const uri =
    process.env.IYZICO_BASE_URL?.trim() || "https://api.iyzipay.com";

  if (!apiKey || !secretKey) {
    throw new Error("iyzico is not configured (missing API keys)");
  }

  return new Iyzipay({
    apiKey,
    secretKey,
    uri,
  });
}

export function iyzicoCreateCheckoutForm(
  iyzipay: InstanceType<typeof Iyzipay>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any,
): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) reject(err);
      else resolve((result || {}) as unknown as IyzicoResult);
    });
  });
}

export function iyzicoRetrieveCheckoutForm(
  iyzipay: InstanceType<typeof Iyzipay>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any,
): Promise<IyzicoResult> {
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve(request, (err, result) => {
      if (err) reject(err);
      else resolve((result || {}) as unknown as IyzicoResult);
    });
  });
}

export { Iyzipay };
