import { APP_DOMAIN, APP_DOMAIN_WWW } from "@/lib/constants/urls";
import type Stripe from "stripe";

const DOMAINS_TO_REGISTER = [APP_DOMAIN, APP_DOMAIN_WWW] as const;

type WalletStatus = {
  status?: string;
  status_details?: { error_message?: string | null } | null;
};

type PaymentMethodDomainRow = Stripe.PaymentMethodDomain & {
  apple_pay?: WalletStatus | null;
  google_pay?: WalletStatus | null;
};

function isAlreadyRegisteredError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("already exists") ||
    message.includes("already been registered") ||
    message.includes("duplicate")
  );
}

function walletIsActive(wallet: WalletStatus | null | undefined): boolean {
  return wallet?.status === "active";
}

function domainNeedsAttention(row: PaymentMethodDomainRow): boolean {
  if (!row.enabled) return true;
  if (!walletIsActive(row.apple_pay)) return true;
  if (!walletIsActive(row.google_pay)) return true;
  return false;
}

function logDomainStatus(row: PaymentMethodDomainRow): void {
  if (!domainNeedsAttention(row)) return;

  console.warn(
    `[stripe] Payment domain ${row.domain_name} needs attention:`,
    JSON.stringify({
      enabled: row.enabled,
      apple_pay: row.apple_pay?.status,
      apple_pay_error: row.apple_pay?.status_details?.error_message ?? null,
      google_pay: row.google_pay?.status,
      google_pay_error: row.google_pay?.status_details?.error_message ?? null,
    }),
  );
}

async function ensureDomainRegistered(
  stripe: Stripe,
  domain_name: string,
  existingByName: Map<string, PaymentMethodDomainRow>,
): Promise<PaymentMethodDomainRow | null> {
  const normalized = domain_name.toLowerCase();
  let row = existingByName.get(normalized) ?? null;

  if (!row) {
    try {
      row = (await stripe.paymentMethodDomains.create({
        domain_name,
      })) as PaymentMethodDomainRow;
      existingByName.set(normalized, row);
    } catch (err) {
      if (!isAlreadyRegisteredError(err)) {
        console.warn(
          `Could not register payment method domain ${domain_name}:`,
          err,
        );
        return null;
      }

      const { data } = await stripe.paymentMethodDomains.list({ limit: 100 });
      row =
        (data.find(
          (item) => item.domain_name.toLowerCase() === normalized,
        ) as PaymentMethodDomainRow | undefined) ?? null;
      if (row) existingByName.set(normalized, row);
    }
  }

  if (!row?.id) return null;

  if (!row.enabled) {
    try {
      row = (await stripe.paymentMethodDomains.update(row.id, {
        enabled: true,
      })) as PaymentMethodDomainRow;
      existingByName.set(normalized, row);
    } catch (err) {
      console.warn(`Could not enable payment domain ${domain_name}:`, err);
    }
  }

  if (domainNeedsAttention(row)) {
    try {
      row = (await stripe.paymentMethodDomains.validate(
        row.id,
      )) as PaymentMethodDomainRow;
      existingByName.set(normalized, row);
    } catch (err) {
      console.warn(`Could not validate payment domain ${domain_name}:`, err);
    }
  }

  logDomainStatus(row);
  return row;
}

/**
 * Registers and validates production domains so Apple Pay / Google Pay can render.
 * Re-validates existing domains when wallets are inactive.
 */
export async function ensurePaymentMethodDomains(
  stripe: Stripe,
): Promise<void> {
  try {
    const { data: existing } = await stripe.paymentMethodDomains.list({
      limit: 100,
    });

    const existingByName = new Map<string, PaymentMethodDomainRow>();
    for (const row of existing) {
      existingByName.set(row.domain_name.toLowerCase(), row);
    }

    for (const domain_name of DOMAINS_TO_REGISTER) {
      await ensureDomainRegistered(stripe, domain_name, existingByName);
    }
  } catch (err) {
    console.warn("Payment method domain sync skipped:", err);
  }
}
