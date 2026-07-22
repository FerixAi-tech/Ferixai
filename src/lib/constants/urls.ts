export const APP_DOMAIN = "ferixai.com";
export const APP_DOMAIN_WWW = "www.ferixai.com";
export const SUPPORT_EMAIL = "support@ferixai.com";
export const APP_URL = "https://www.ferixai.com";

export const APP_HOSTS = [
  APP_DOMAIN,
  APP_DOMAIN_WWW,
  "localhost",
  "127.0.0.1",
];

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/**
 * Public site origin for redirects, SEO, and payment callbacks.
 * Never returns localhost in production — that breaks iyzico 3DS return URLs.
 */
export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const isProd = process.env.NODE_ENV === "production";

  if (fromEnv) {
    if (isProd && isLocalhostUrl(fromEnv)) {
      // Misconfigured Vercel env (common copy of .env.example) — use canonical domain
      return APP_URL;
    }
    return fromEnv;
  }

  if (isProd) {
    return APP_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

/**
 * Prefer the host that actually received the request (iyzico callback),
 * falling back to getAppBaseUrl() when the request looks local/misrouted.
 */
export function getRequestBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost || request.headers.get("host") || "")
    .split(",")[0]
    ?.trim();
  const proto = (
    request.headers.get("x-forwarded-proto") ||
    (host && !isLocalhostUrl(`http://${host}`) ? "https" : "http")
  )
    .split(",")[0]
    ?.trim();

  if (host && !isLocalhostUrl(`${proto}://${host}`)) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  try {
    const url = new URL(request.url);
    if (!isLocalhostUrl(url.origin)) {
      return url.origin;
    }
  } catch {
    // ignore
  }

  return getAppBaseUrl();
}

export function normalizeHost(host: string): string {
  return host.split(":")[0].toLowerCase();
}

export function isAppHost(host: string): boolean {
  const normalized = normalizeHost(host);
  return APP_HOSTS.some((h) => h.toLowerCase() === normalized);
}
