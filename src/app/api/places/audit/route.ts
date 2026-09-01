import { NextResponse } from "next/server";
import { saveLandingAuditSimulation } from "@/lib/audit/save-simulation";
import {
  getAuditCategoryConfig,
  getCategoryPlacesSearchQuery,
  isAuditCategory,
} from "@/lib/constants/audit-sectors";
import { normalizeCategoryName } from "@/lib/constants/categories";
import {
  getPlaceDetailsById,
  lookupBusinessByTextQuery,
  searchCategoryCompetitors,
} from "@/lib/preview/places";

export const runtime = "nodejs";

function resolveCity(city: string): string {
  const trimmed = city.trim();
  if (!trimmed || trimmed === "United Arab Emirates") return "Dubai";
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      placeId?: string;
      businessName?: string;
      category?: string;
      manualWebsite?: string;
      manualPhone?: string;
    };

    const placeId = body.placeId?.trim();
    const businessName = body.businessName?.trim();
    const category = normalizeCategoryName(body.category ?? "");
    const manualWebsite = body.manualWebsite?.trim() || null;
    const manualPhone = body.manualPhone?.trim() || null;

    if (!isAuditCategory(category)) {
      return NextResponse.json(
        { error: "Please select or enter a valid category." },
        { status: 400 },
      );
    }

    if (!placeId && !businessName) {
      return NextResponse.json(
        {
          error:
            "Enter your UAE business name or pick a Google Maps suggestion.",
        },
        { status: 400 },
      );
    }

    const place = placeId
      ? await getPlaceDetailsById(placeId)
      : await lookupBusinessByTextQuery(businessName!);

    const config = getAuditCategoryConfig(category);
    const city = resolveCity(place.city);
    const resolvedName =
      place.name?.trim() || businessName?.trim() || "Your UAE business";
    const boneQuestion = config.boneQuestion(city);
    const phoneNumber = manualPhone || place.phoneNumber;
    const websiteUri = manualWebsite || place.websiteUri;

    const liveCompetitors = await searchCategoryCompetitors({
      searchQuery: getCategoryPlacesSearchQuery(category, city),
      excludeName: resolvedName,
      excludePlaceId: place.placeId,
    });

    const competitors =
      liveCompetitors.length >= 3
        ? liveCompetitors.slice(0, 3).map((competitor, index) => ({
            name: competitor.name,
            subtitle:
              config.competitors[index]?.subtitle ?? competitor.subtitle,
          }))
        : config.competitors;

    await saveLandingAuditSimulation({
      category,
      businessName: resolvedName,
      formattedAddress: place.formattedAddress,
      city,
      phoneNumber,
      websiteUri,
      googleRating: place.rating,
      googleReviewCount: place.userRatingsTotal,
      placeId: place.placeId,
      fromGoogle: place.fromGoogle,
      manualEntry: !placeId,
      boneQuestion,
      competitors,
      referrer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({
      ok: true,
      result: {
        businessName: resolvedName,
        formattedAddress: place.formattedAddress,
        phoneNumber,
        websiteUri,
        rating: place.rating,
        userRatingsTotal: place.userRatingsTotal,
        city,
        placeId: place.placeId,
        fromGoogle: place.fromGoogle,
        category,
        boneQuestion,
        competitors,
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
