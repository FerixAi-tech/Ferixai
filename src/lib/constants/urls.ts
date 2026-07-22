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

export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return APP_URL;
}

export function normalizeHost(host: string): string {
  return host.split(":")[0].toLowerCase();
}

export function isAppHost(host: string): boolean {
  const normalized = normalizeHost(host);
  return APP_HOSTS.some((h) => h.toLowerCase() === normalized);
}
