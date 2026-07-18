import { clearAdminPanelSession } from "@/lib/auth/admin-panel";
import { NextResponse } from "next/server";

export async function POST() {
  await clearAdminPanelSession();
  return NextResponse.json({ success: true });
}
