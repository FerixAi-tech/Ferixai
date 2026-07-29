import { ensureCategorySaved } from "@/lib/categories/ensure-category";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String((body as { name?: unknown }).name || "");
    const id = await ensureCategorySaved(name);
    return NextResponse.json({ success: true, id, name: name.trim() });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Could not save category",
      },
      { status: 400 },
    );
  }
}
