import { NextResponse } from "next/server";
import { PROMO_DISCOUNT_GBP } from "@/lib/constants/pricing-plans";
import {
  assertPromoCodeAvailable,
  normalizePromoCode,
} from "@/lib/promo/codes";

/**
 * Promo validation for unique FX30-XXXXX welcome codes (£30 off first month).
 * Each code can only be redeemed once.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const raw = normalizePromoCode(body.code || "");

    if (!raw) {
      return NextResponse.json(
        { valid: false, error: "Please enter a promo code." },
        { status: 400 },
      );
    }

    try {
      const code = await assertPromoCodeAvailable(raw);
      return NextResponse.json({
        valid: true,
        code,
        discountGbp: PROMO_DISCOUNT_GBP,
        message: `£${PROMO_DISCOUNT_GBP} off your first month`,
      });
    } catch (err) {
      return NextResponse.json(
        {
          valid: false,
          error:
            err instanceof Error ? err.message : "That code is not valid.",
        },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { valid: false, error: "Could not validate promo code." },
      { status: 500 },
    );
  }
}
