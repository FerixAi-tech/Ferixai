export type PlacesLookupInput = {
  businessName: string;
  city: string;
};

export type PlacesLookupResult = {
  formattedAddress: string;
  rating: number | null;
  userRatingsTotal: number | null;
  placeId: string | null;
  fromGoogle: boolean;
};

type GoogleTextSearchResponse = {
  status?: string;
  error_message?: string;
  results?: Array<{
    formatted_address?: string;
    rating?: number;
    user_ratings_total?: number;
    place_id?: string;
    name?: string;
  }>;
};

function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || undefined;
}

/** Graceful fallback when Places has no match or is not configured. */
export function fallbackPlacesResult(city: string): PlacesLookupResult {
  const trimmedCity = city.trim() || "United Kingdom";
  return {
    formattedAddress: `${trimmedCity}, UK`,
    rating: null,
    userRatingsTotal: null,
    placeId: null,
    fromGoogle: false,
  };
}

/**
 * Lookup a UK business via Google Places Text Search.
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
  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(query)}` +
    `&key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Google Places HTTP error:", response.status);
      return fallbackPlacesResult(city);
    }

    const body = (await response.json()) as GoogleTextSearchResponse;
    if (body.status && body.status !== "OK" && body.status !== "ZERO_RESULTS") {
      console.error(
        "Google Places status:",
        body.status,
        body.error_message || "",
      );
      return fallbackPlacesResult(city);
    }

    const top = body.results?.[0];
    if (!top) {
      return fallbackPlacesResult(city);
    }

    return {
      formattedAddress:
        top.formatted_address?.trim() || `${city || "United Kingdom"}, UK`,
      rating: typeof top.rating === "number" ? top.rating : null,
      userRatingsTotal:
        typeof top.user_ratings_total === "number"
          ? top.user_ratings_total
          : null,
      placeId: top.place_id?.trim() || null,
      fromGoogle: true,
    };
  } catch (err) {
    console.error("Google Places lookup failed:", err);
    return fallbackPlacesResult(city);
  }
}
