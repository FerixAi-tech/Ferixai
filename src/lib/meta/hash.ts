import { createHash } from "crypto";

/** Normalize then SHA-256 hex digest for Meta CAPI user data fields. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Meta email: trim + lowercase before hash. */
export function hashEmail(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;
  return sha256(normalized);
}

/**
 * Meta phone: digits only (prefer E.164 without '+').
 * Returns undefined if fewer than 7 digits remain.
 */
export function hashPhone(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return undefined;
  return sha256(digits);
}
