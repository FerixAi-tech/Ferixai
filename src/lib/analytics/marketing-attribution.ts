/** Paid/organic campaign params — keep landing page visible for logged-in users. */
export function hasMarketingAttribution(
  searchParams: Pick<URLSearchParams, "has" | "get">,
): boolean {
  if (
    searchParams.has("gclid") ||
    searchParams.has("gbraid") ||
    searchParams.has("wbraid") ||
    searchParams.has("utm_source") ||
    searchParams.has("utm_medium") ||
    searchParams.has("utm_campaign")
  ) {
    return true;
  }

  return searchParams.get("signup") === "1";
}
