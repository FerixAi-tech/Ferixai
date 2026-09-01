import { NextResponse } from "next/server";
import {
  getAuditSector,
  isAuditSectorId,
  type AuditSectorId,
} from "@/lib/constants/audit-sectors";
import {
  getPlaceDetailsById,
  lookupBusinessByTextQuery,
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
      sectorId?: string;
      customCategoryLabel?: string;
      manualWebsite?: string;
      manualPhone?: string;
    };

    const placeId = body.placeId?.trim();
    const businessName = body.businessName?.trim();
    const sectorId = body.sectorId?.trim() ?? "";
    const customCategoryLabel = body.customCategoryLabel?.trim();
    const manualWebsite = body.manualWebsite?.trim() || null;
    const manualPhone = body.manualPhone?.trim() || null;

    if (!isAuditSectorId(sectorId)) {
      return NextResponse.json(
        { error: "Please select your business sector." },
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

    const sector = getAuditSector(sectorId as AuditSectorId);
    const city = resolveCity(place.city);
    const resolvedName =
      place.name?.trim() || businessName?.trim() || "Your UAE business";
    const boneQuestion = sector.boneQuestion(city, customCategoryLabel);

    return NextResponse.json({
      ok: true,
      result: {
        businessName: resolvedName,
        formattedAddress: place.formattedAddress,
        phoneNumber: manualPhone || place.phoneNumber,
        websiteUri: manualWebsite || place.websiteUri,
        rating: place.rating,
        userRatingsTotal: place.userRatingsTotal,
        city,
        placeId: place.placeId,
        fromGoogle: place.fromGoogle,
        sectorId: sector.id,
        sectorLabel: sector.label,
        campaignCategory:
          sector.id === "general" && customCategoryLabel
            ? customCategoryLabel
            : sector.campaignCategory,
        boneQuestion,
        competitors: sector.competitors,
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
