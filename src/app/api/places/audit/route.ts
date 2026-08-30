import { NextResponse } from "next/server";
import {
  AI_AUDIT_STATUS_ITEMS,
  computeAiVisibilityScore,
} from "@/lib/preview/ai-audit-score";
import {
  getPlaceDetailsById,
  lookupBusinessByTextQuery,
} from "@/lib/preview/places";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      placeId?: string;
      businessName?: string;
    };
    const placeId = body.placeId?.trim();
    const businessName = body.businessName?.trim();

    if (!placeId && !businessName) {
      return NextResponse.json(
        {
          error:
            "Enter your UAE business name or pick a suggestion, then scan again.",
        },
        { status: 400 },
      );
    }

    const place = placeId
      ? await getPlaceDetailsById(placeId)
      : await lookupBusinessByTextQuery(businessName!);

    const resolvedName =
      place.name?.trim() || businessName?.trim() || "Your UAE business";
    const scoreSeed = place.placeId || resolvedName;
    const { score, band } = computeAiVisibilityScore(scoreSeed);

    return NextResponse.json({
      ok: true,
      result: {
        businessName: resolvedName,
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
