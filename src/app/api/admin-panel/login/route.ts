import {
  setAdminPanelSession,
  verifyAdminPanelPassword,
} from "@/lib/auth/admin-panel";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password || "");

    if (!verifyAdminPanelPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await setAdminPanelSession();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
