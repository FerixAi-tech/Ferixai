import { hashEmail, hashPhone } from "@/lib/meta/hash";
import { META_PIXEL_ID as PUBLIC_PIXEL_ID } from "@/lib/meta/pixel";

const GRAPH_API_VERSION = "v19.0";
const DEFAULT_CONTENT_NAME = "FerixAI Subscription";

export type MetaCAPIEventInput = {
  /** Defaults to Purchase. */
  eventName?: string;
  /** Must match Pixel `eventID` for deduplication. Prefer payment order id. */
  eventId: string;
  value: number;
  currency?: string;
  contentName?: string;
  eventSourceUrl?: string;
  eventTime?: number;
  email?: string | null;
  phone?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  fbc?: string | null;
  fbp?: string | null;
};

export type MetaCAPISendResult =
  | { ok: true; eventsReceived?: number }
  | { ok: false; skipped?: boolean; error: string };

function getPixelId(): string | undefined {
  return (
    process.env.META_PIXEL_ID?.trim() ||
    PUBLIC_PIXEL_ID ||
    undefined
  );
}

function getAccessToken(): string | undefined {
  return process.env.META_CAPI_TOKEN?.trim() || undefined;
}

function buildUserData(input: MetaCAPIEventInput): Record<string, unknown> {
  const userData: Record<string, unknown> = {};

  const em = input.email ? hashEmail(input.email) : undefined;
  if (em) userData.em = [em];

  const ph = input.phone ? hashPhone(input.phone) : undefined;
  if (ph) userData.ph = [ph];

  const ip = input.ip?.trim();
  if (ip) userData.client_ip_address = ip;

  const ua = input.userAgent?.trim();
  if (ua) userData.client_user_agent = ua;

  const fbc = input.fbc?.trim();
  if (fbc) userData.fbc = fbc;

  const fbp = input.fbp?.trim();
  if (fbp) userData.fbp = fbp;

  return userData;
}

/**
 * Send a server-side Meta Conversion API event (defaults to Purchase).
 * Skips when META_PIXEL_ID / META_CAPI_TOKEN are not configured.
 * Failures are returned — callers should not block payment fulfillment.
 */
export async function sendMetaCAPIEvent(
  input: MetaCAPIEventInput,
): Promise<MetaCAPISendResult> {
  const pixelId = getPixelId();
  const accessToken = getAccessToken();

  if (!pixelId || !accessToken) {
    return {
      ok: false,
      skipped: true,
      error: "Meta CAPI not configured (META_PIXEL_ID / META_CAPI_TOKEN)",
    };
  }

  if (!(input.value > 0) || !input.eventId.trim()) {
    return { ok: false, error: "Invalid event value or eventId" };
  }

  const event = {
    event_name: input.eventName || "Purchase",
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId.trim(),
    action_source: "website" as const,
    event_source_url: input.eventSourceUrl || undefined,
    user_data: buildUserData(input),
    custom_data: {
      currency: (input.currency || "USD").toUpperCase(),
      value: Number(input.value),
      content_name: input.contentName || DEFAULT_CONTENT_NAME,
    },
  };

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      events_received?: number;
      error?: { message?: string };
    };

    if (!response.ok) {
      return {
        ok: false,
        error: body.error?.message || `Meta CAPI HTTP ${response.status}`,
      };
    }

    return { ok: true, eventsReceived: body.events_received };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Meta CAPI request failed",
    };
  }
}

/** Read Meta click/browser ids from a Cookie header string. */
export function parseMetaCookies(
  cookieHeader: string | null | undefined,
): { fbp?: string; fbc?: string } {
  if (!cookieHeader) return {};
  const out: { fbp?: string; fbc?: string } = {};
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!value) continue;
    if (name === "_fbp") out.fbp = decodeURIComponent(value);
    if (name === "_fbc") out.fbc = decodeURIComponent(value);
  }
  return out;
}

export function getClientIpFromHeaders(headers: Headers): string | undefined {
  const forwarded = headers.get("x-forwarded-for");
  const fromForwarded = forwarded?.split(",")[0]?.trim();
  if (fromForwarded) return fromForwarded;
  return headers.get("x-real-ip")?.trim() || undefined;
}
