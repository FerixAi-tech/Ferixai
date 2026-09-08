const STORAGE_KEY = "ferix_marketing_attribution";

export const MARKETING_PARAM_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

/** Paid/organic campaign params — keep landing page visible for logged-in users. */
export function hasMarketingAttribution(
  searchParams: Pick<URLSearchParams, "has" | "get">,
): boolean {
  if (MARKETING_PARAM_KEYS.some((key) => searchParams.has(key))) {
    return true;
  }

  return searchParams.get("signup") === "1";
}

export function extractMarketingParams(
  searchParams: URLSearchParams,
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const key of MARKETING_PARAM_KEYS) {
    const value = searchParams.get(key)?.trim();
    if (value) out[key] = value;
  }

  if (searchParams.get("signup") === "1") {
    out.signup = "1";
  }

  return out;
}

export function getStoredMarketingAttribution(): Record<string, string> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

/** Persist first-touch campaign params for the browser session. */
export function persistMarketingAttribution(
  searchParams: URLSearchParams,
): Record<string, string> | null {
  if (typeof window === "undefined") return null;

  const incoming = extractMarketingParams(searchParams);
  if (Object.keys(incoming).length === 0) {
    return getStoredMarketingAttribution();
  }

  try {
    const existing = getStoredMarketingAttribution() ?? {};
    const merged = { ...existing, ...incoming };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return incoming;
  }
}

export function hasMarketingAttributionClient(): boolean {
  if (typeof window === "undefined") return false;

  if (hasMarketingAttribution(new URLSearchParams(window.location.search))) {
    return true;
  }

  const stored = getStoredMarketingAttribution();
  return stored !== null && Object.keys(stored).length > 0;
}

export function appendMarketingParams(path: string): string {
  if (typeof window === "undefined") return path;

  const stored = getStoredMarketingAttribution();
  const fromUrl = extractMarketingParams(
    new URLSearchParams(window.location.search),
  );
  const attrs = { ...stored, ...fromUrl };

  if (Object.keys(attrs).length === 0) return path;

  const base = path.startsWith("http")
    ? path
    : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
  const url = new URL(base);

  for (const [key, value] of Object.entries(attrs)) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }

  return path.startsWith("http")
    ? url.toString()
    : `${url.pathname}${url.search}`;
}

/** Copy marketing params from the incoming request onto a redirect URL. */
export function copyMarketingParamsToUrl(
  source: URLSearchParams,
  target: URL,
): void {
  for (const [key, value] of Object.entries(extractMarketingParams(source))) {
    if (!target.searchParams.has(key)) {
      target.searchParams.set(key, value);
    }
  }
}
