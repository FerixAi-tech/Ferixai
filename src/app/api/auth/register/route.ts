import { resolveRegistrationSource } from "@/lib/auth/registration-source";
import { getSafeInternalPath } from "@/lib/auth/safe-redirect";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, redirect } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password and full name are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(fullName).trim();
    const source = resolveRegistrationSource({
      redirect,
      host: request.headers.get("host"),
      referer: request.headers.get("referer"),
    });

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: normalizedName,
        registration_source: source,
      },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("already") || message.includes("registered")) {
        return NextResponse.json(
          { error: "This email is already registered" },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Could not create account" },
        { status: 500 },
      );
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: userId,
        full_name: normalizedName,
        email: normalizedEmail,
        registration_source: source,
      })
      .select("id, email, full_name")
      .single();

    const profileOk =
      !profileError &&
      !!profile?.id &&
      profile.id === userId &&
      !!profile.email &&
      !!profile.full_name;

    if (!profileOk) {
      console.error("Profile upsert failed after createUser:", profileError);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        {
          error:
            "Could not create your profile. Please try again. Your account was not saved.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      registrationSource: source,
      userId,
      redirectTo: getSafeInternalPath(redirect, "/dashboard"),
    });
  } catch (err) {
    console.error("Register route error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
