import { NextResponse } from "next/server";
import { buildAiPreviewPayload } from "@/lib/preview/build-answer";
import { lookupBusinessPlace } from "@/lib/preview/places";

export const runtime = "nodejs";

type PreviewRequestBody = {
  businessName?: string;
  city?: string;
  category?: string;
  feature1?: string;
  feature2?: string;
  feature3?: string;
};

function asTrimmed(value: unknown, max = 120): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/**
 * Live business audit + ChatGPT-style recommendation preview.
 * Uses Google Places Text Search when GOOGLE_PLACES_API_KEY is set.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewRequestBody;

    const businessName = asTrimmed(body.businessName, 120);
    const city = asTrimmed(body.city, 80);
    const category = asTrimmed(body.category, 80);
    const feature1 = asTrimmed(body.feature1, 120) || undefined;
    const feature2 = asTrimmed(body.feature2, 120) || undefined;
    const feature3 = asTrimmed(body.feature3, 120) || undefined;

    if (businessName.length < 2) {
      return NextResponse.json(
        { error: "Please enter a business name (at least 2 characters)." },
        { status: 400 },
      );
    }
    if (city.length < 2) {
      return NextResponse.json(
        { error: "Please select a town or city." },
        { status: 400 },
      );
    }
    if (category.length < 2) {
      return NextResponse.json(
        { error: "Please select a category." },
        { status: 400 },
      );
    }

    const place = await lookupBusinessPlace({ businessName, city });
    const preview = buildAiPreviewPayload({
      businessName,
      city,
      category,
      feature1,
      feature2,
      feature3,
      address: place.formattedAddress,
      rating: place.rating,
      userRatingsTotal: place.userRatingsTotal,
      fromGoogle: place.fromGoogle,
      placeId: place.placeId,
    });

    return NextResponse.json({
      ok: true,
      preview,
    });
  } catch (err) {
    console.error("preview-ai error:", err);
    return NextResponse.json(
      { error: "Could not generate AI preview. Please try again." },
      { status: 500 },
    );
  }
}
