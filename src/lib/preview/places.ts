export type PlacesLookupInput = {
  businessName: string;
  city: string;
};

export type PlacesLookupResult = {
  name: string | null;
  formattedAddress: string;
  phoneNumber: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  placeId: string | null;
  fromGoogle: boolean;
};

type GoogleTextSearchResponse = {
  status?: string;
  error_message?: string;
  results?: Array<{
    place_id?: string;
    name?: string;
    formatted_address?: string;
    rating?: number;
    user_ratings_total?: number;
  }>;
};

type GooglePlaceDetailsResponse = {
  status?: string;
  error_message?: string;
  result?: {
    name?: string;
    formatted_address?: string;
    international_phone_number?: string;
    formatted_phone_number?: string;
    rating?: number;
    user_ratings_total?: number;
  };
};

function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || undefined;
}

/** Graceful fallback when Places has no match or is not configured. */
export function fallbackPlacesResult(city: string): PlacesLookupResult {
  const trimmedCity = city.trim() || "United Kingdom";
  return {
    name: null,
    formattedAddress: `${trimmedCity}, UK`,
    phoneNumber: null,
    rating: null,
    userRatingsTotal: null,
    placeId: null,
    fromGoogle: false,
  };
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string,
): Promise<{
  name: string | null;
  formattedAddress: string | null;
  phoneNumber: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
} | null> {
  const fields = [
    "name",
    "formatted_address",
    "international_phone_number",
    "formatted_phone_number",
    "rating",
    "user_ratings_total",
  ].join(",");

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=${encodeURIComponent(fields)}` +
    `&key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, { method: "GET", cache: "no-store" });
  if (!response.ok) {
    console.error("Google Place Details HTTP error:", response.status);
    return null;
  }

  const body = (await response.json()) as GooglePlaceDetailsResponse;
  if (body.status && body.status !== "OK") {
    console.error(
      "Google Place Details status:",
      body.status,
      body.error_message || "",
    );
    return null;
  }

  const result = body.result;
  if (!result) return null;

  const phone =
    result.formatted_phone_number?.trim() ||
    result.international_phone_number?.trim() ||
    null;

  return {
    name: result.name?.trim() || null,
    formattedAddress: result.formatted_address?.trim() || null,
    phoneNumber: phone,
    rating: typeof result.rating === "number" ? result.rating : null,
    userRatingsTotal:
      typeof result.user_ratings_total === "number"
        ? result.user_ratings_total
        : null,
  };
}

/**
 * Text Search → Place Details for real address, phone, and rating.
 * Falls back to city-only defaults when the API is missing or returns no hit.
 */
export async function lookupBusinessPlace(
  input: PlacesLookupInput,
): Promise<PlacesLookupResult> {
  const apiKey = getApiKey();
  const city = input.city.trim();
  const businessName = input.businessName.trim();

  if (!apiKey || !businessName) {
    return fallbackPlacesResult(city);
  }

  const query = [businessName, city, "UK"].filter(Boolean).join(" ");
  const searchUrl =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(query)}` +
    `&key=${encodeURIComponent(apiKey)}`;

  try {
    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!searchResponse.ok) {
      console.error("Google Places Text Search HTTP error:", searchResponse.status);
      return fallbackPlacesResult(city);
    }

    const searchBody =
      (await searchResponse.json()) as GoogleTextSearchResponse;
    if (
      searchBody.status &&
      searchBody.status !== "OK" &&
      searchBody.status !== "ZERO_RESULTS"
    ) {
      console.error(
        "Google Places Text Search status:",
        searchBody.status,
        searchBody.error_message || "",
      );
      return fallbackPlacesResult(city);
    }

    const top = searchBody.results?.[0];
    const placeId = top?.place_id?.trim();
    if (!top || !placeId) {
      return fallbackPlacesResult(city);
    }

    const details = await fetchPlaceDetails(placeId, apiKey);
    const addressFallback =
      details?.formattedAddress ||
      top.formatted_address?.trim() ||
      `${city || "United Kingdom"}, UK`;

    return {
      name: details?.name || top.name?.trim() || null,
      formattedAddress: addressFallback,
      phoneNumber: details?.phoneNumber || null,
      rating:
        details?.rating ??
        (typeof top.rating === "number" ? top.rating : null),
      userRatingsTotal:
        details?.userRatingsTotal ??
        (typeof top.user_ratings_total === "number"
          ? top.user_ratings_total
          : null),
      placeId,
      fromGoogle: true,
    };
  } catch (err) {
    console.error("Google Places lookup failed:", err);
    return fallbackPlacesResult(city);
  }
}
