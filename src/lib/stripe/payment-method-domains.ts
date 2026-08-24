import { APP_DOMAIN, APP_DOMAIN_WWW } from "@/lib/constants/urls";
import type Stripe from "stripe";

const DOMAINS_TO_REGISTER = [APP_DOMAIN, APP_DOMAIN_WWW] as const;

function isAlreadyRegisteredError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("already exists") ||
    message.includes("already been registered") ||
    message.includes("duplicate")
  );
}

/**
 * Registers production domains with Stripe so Apple Pay / Google Pay can render.
 * Safe to call on each checkout — skips domains that are already registered.
 */
export async function ensurePaymentMethodDomains(
  stripe: Stripe,
): Promise<void> {
  try {
    const { data: existing } = await stripe.paymentMethodDomains.list({
      limit: 100,
    });
    const registered = new Set(
      existing.map((row) => row.domain_name.toLowerCase()),
    );

    for (const domain_name of DOMAINS_TO_REGISTER) {
      const normalized = domain_name.toLowerCase();
      if (registered.has(normalized)) continue;

      try {
        const created = await stripe.paymentMethodDomains.create({
          domain_name,
        });
        registered.add(normalized);
        if (created.id) {
          await stripe.paymentMethodDomains.validate(created.id);
        }
      } catch (err) {
        if (!isAlreadyRegisteredError(err)) {
          console.warn(
            `Could not register payment method domain ${domain_name}:`,
            err,
          );
        }
      }
    }
  } catch (err) {
    console.warn("Payment method domain sync skipped:", err);
  }
}
