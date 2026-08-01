import { createAdminClient } from "@/lib/supabase/admin";

/** Public UK launch promo — shared campaign code (one use per user). */
export const LAUNCH_PROMO_CODE = "FX30";

/** FX30-XXXXX — unique welcome codes issued at signup. */
const UNIQUE_PROMO_PATTERN = /^FX30-[A-Z0-9]{5}$/;

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isLaunchPromoCode(code: string): boolean {
  return normalizePromoCode(code) === LAUNCH_PROMO_CODE;
}

export function isValidPromoFormat(code: string): boolean {
  const normalized = normalizePromoCode(code);
  return (
    normalized === LAUNCH_PROMO_CODE || UNIQUE_PROMO_PATTERN.test(normalized)
  );
}

/** Storage key for shared FX30 so each user can redeem once. */
function launchPromoStorageCode(userId: string): string {
  return `${LAUNCH_PROMO_CODE}:${userId}`;
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

export async function assertPromoCodeAvailable(
  code: string,
  userId?: string,
): Promise<string> {
  const normalized = normalizePromoCode(code);

  if (!isValidPromoFormat(normalized)) {
    throw new Error(
      "Enter promo code FX30 or your unique FX30-XXXXX welcome code.",
    );
  }

  if (normalized === LAUNCH_PROMO_CODE) {
    if (userId) {
      if (await isPromoCodeRedeemed(launchPromoStorageCode(userId))) {
        throw new Error(
          "You have already used the FX30 launch offer on this account.",
        );
      }
    }
    return normalized;
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
  const normalized = await assertPromoCodeAvailable(
    options.code,
    options.userId,
  );
  const admin = createAdminClient();
  const storageCode =
    normalized === LAUNCH_PROMO_CODE
      ? launchPromoStorageCode(options.userId)
      : normalized;

  const { error } = await admin.from("promo_redemptions").insert({
    code: storageCode,
    user_id: options.userId,
    campaign_id: options.campaignId || null,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        normalized === LAUNCH_PROMO_CODE
          ? "You have already used the FX30 launch offer on this account."
          : "This promo code has already been used and cannot be applied again.",
      );
    }
    throw new Error(error.message || "Could not redeem promo code");
  }
}
