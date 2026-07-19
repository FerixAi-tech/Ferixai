import { NextResponse } from "next/server";
import { PROMO_DISCOUNT_GBP } from "@/lib/constants/pricing-plans";

/**
 * Promo validation for welcome FX30 codes (£30 off first month).
 * Accepts FX30 and common variants; extend later with DB-backed codes.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const raw = (body.code || "").trim().toUpperCase();

    if (!raw) {
      return NextResponse.json(
        { valid: false, error: "Please enter a promo code." },
        { status: 400 },
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 450));

    const valid =
      raw === "FX30" ||
      raw.startsWith("FX30-") ||
      /^FX30[A-Z0-9]{0,8}$/.test(raw);

    if (!valid) {
      return NextResponse.json(
        {
          valid: false,
          error: "That code is not valid. Check your FX30 code.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      code: raw,
      discountGbp: PROMO_DISCOUNT_GBP,
      message: `£${PROMO_DISCOUNT_GBP} off your first month`,
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Could not validate promo code." },
      { status: 500 },
    );
  }
}
