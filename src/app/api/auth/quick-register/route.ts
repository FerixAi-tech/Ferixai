import { generateQuickRegisterPassword } from "@/lib/auth/quick-register";
import { resolveRegistrationSource } from "@/lib/auth/registration-source";
import { getSafeInternalPath } from "@/lib/auth/safe-redirect";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const businessName = String(body.businessName || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const redirect = body.redirect;

    if (businessName.length < 2) {
      return NextResponse.json(
        { error: "Business name must be at least 2 characters" },
        { status: 400 },
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const source = resolveRegistrationSource({
      redirect,
      registrationSource: body.registrationSource,
      host: request.headers.get("host"),
      referer: request.headers.get("referer"),
    });

    const password = generateQuickRegisterPassword();
    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: businessName,
        registration_source: source,
      },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("already") || message.includes("registered")) {
        return NextResponse.json(
          {
            error:
              "This email is already registered. Please sign in to continue.",
          },
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
        full_name: businessName,
        email,
        registration_source: source,
      })
      .select("id, email, full_name")
      .single();

    const profileOk =
      !profileError &&
      !!profile?.id &&
      profile.id === userId &&
      !!profile.email;

    if (!profileOk) {
      console.error("Quick register profile upsert failed:", profileError);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        {
          error:
            "Could not create your profile. Please try again. Your account was not saved.",
        },
        { status: 500 },
      );
    }

    await admin.from("ferixai_leads").insert({
      user_id: userId,
      email,
      business_name: businessName,
      registration_source: source,
    });

    return NextResponse.json({
      success: true,
      email,
      password,
      businessName,
      userId,
      redirectTo: getSafeInternalPath(redirect, "/dashboard/new"),
    });
  } catch (err) {
    console.error("Quick register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
