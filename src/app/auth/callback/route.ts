import { createClient } from "@/lib/supabase/server";
import { getSafeInternalPath } from "@/lib/auth/safe-redirect";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = getSafeInternalPath(
    url.searchParams.get("redirect"),
    "/dashboard",
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const fail = new URL("/auth", url.origin);
      fail.searchParams.set("mode", "login");
      fail.searchParams.set("error", "magic_link_failed");
      fail.searchParams.set("redirect", redirect);
      return NextResponse.redirect(fail);
    }
  }

  return NextResponse.redirect(new URL(redirect, url.origin));
}
