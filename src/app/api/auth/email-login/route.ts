import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Sign in an existing user by email only (no password / no magic-link email).
 * Looks up the account, generates a one-time token server-side, and sets the session cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String((body as { email?: unknown }).email || "")
      .trim()
      .toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (!profile?.id) {
      return NextResponse.json(
        { error: "No account found for this email. Please register first." },
        { status: 404 },
      );
    }

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData) {
      return NextResponse.json(
        {
          error:
            linkError?.message ||
            "No account found for this email. Please register first.",
        },
        { status: 404 },
      );
    }

    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) {
      return NextResponse.json(
        { error: "Could not start sign-in session. Please try again." },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const { data: sessionData, error: verifyError } =
      await supabase.auth.verifyOtp({
        type: "email",
        token_hash: tokenHash,
      });

    if (verifyError || !sessionData.session) {
      return NextResponse.json(
        {
          error:
            verifyError?.message ||
            "Could not complete sign-in. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      userId: sessionData.user?.id ?? profile.id,
    });
  } catch (err) {
    console.error("email-login error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Sign-in failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
