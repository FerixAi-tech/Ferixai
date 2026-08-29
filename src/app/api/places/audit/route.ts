import { NextResponse } from "next/server";
import {
  AI_AUDIT_STATUS_ITEMS,
  computeAiVisibilityScore,
} from "@/lib/preview/ai-audit-score";
import { getPlaceDetailsById } from "@/lib/preview/places";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { placeId?: string };
    const placeId = body.placeId?.trim();

    if (!placeId) {
      return NextResponse.json(
        { error: "Please select a business from the suggestions." },
        { status: 400 },
      );
    }

    const place = await getPlaceDetailsById(placeId);
    const businessName = place.name?.trim() || "Selected business";
    const scoreSeed = place.placeId || businessName;
    const { score, band } = computeAiVisibilityScore(scoreSeed);

    return NextResponse.json({
      ok: true,
      result: {
        businessName,
        formattedAddress: place.formattedAddress,
        phoneNumber: place.phoneNumber,
        rating: place.rating,
        userRatingsTotal: place.userRatingsTotal,
        city: place.city,
        placeId: place.placeId,
        fromGoogle: place.fromGoogle,
        visibilityScore: score,
        visibilityBand: band,
        statusItems: AI_AUDIT_STATUS_ITEMS,
      },
    });
  } catch (err) {
    console.error("places audit error:", err);
    return NextResponse.json(
      { error: "Could not complete the AI visibility scan. Please try again." },
      { status: 500 },
    );
  }
}
