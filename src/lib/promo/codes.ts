import { createAdminClient } from "@/lib/supabase/admin";

/** FX30-XXXXX — unique welcome codes issued at signup. */
const UNIQUE_PROMO_PATTERN = /^FX30-[A-Z0-9]{5}$/;

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidPromoFormat(code: string): boolean {
  return UNIQUE_PROMO_PATTERN.test(normalizePromoCode(code));
}

export async function isPromoCodeRedeemed(code: string): Promise<boolean> {
  const normalized = normalizePromoCode(code);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promo_redemptions")
    .select("id")
    .eq("code", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Could not check promo code");
  }

  return Boolean(data);
}

export async function assertPromoCodeAvailable(code: string): Promise<string> {
  const normalized = normalizePromoCode(code);

  if (!isValidPromoFormat(normalized)) {
    throw new Error(
      "Enter your unique FX30-XXXXX welcome code. Generic FX30 codes are not accepted.",
    );
  }

  if (await isPromoCodeRedeemed(normalized)) {
    throw new Error(
      "This promo code has already been used and cannot be applied again.",
    );
  }

  return normalized;
}

export async function redeemPromoCode(options: {
  code: string;
  userId: string;
  campaignId?: string | null;
}): Promise<void> {
  const normalized = await assertPromoCodeAvailable(options.code);
  const admin = createAdminClient();

  const { error } = await admin.from("promo_redemptions").insert({
    code: normalized,
    user_id: options.userId,
    campaign_id: options.campaignId || null,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "This promo code has already been used and cannot be applied again.",
      );
    }
    throw new Error(error.message || "Could not redeem promo code");
  }
}
