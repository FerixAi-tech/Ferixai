import { NextResponse } from "next/server";
import { autocompletePlacesNl } from "@/lib/preview/places";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await autocompletePlacesNl(query);
  return NextResponse.json({ suggestions });
}
