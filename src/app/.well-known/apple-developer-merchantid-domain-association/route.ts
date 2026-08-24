import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const APPLE_PAY_DOMAIN_FILE = join(
  process.cwd(),
  "public",
  ".well-known",
  "apple-developer-merchantid-domain-association",
);

/** Stripe / Apple Pay domain verification — must return 200 with exact file body. */
export function GET() {
  const body = readFileSync(APPLE_PAY_DOMAIN_FILE, "utf8");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
