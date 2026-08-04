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
    formatted_phone_number?: string;
    international_phone_number?: string;
    rating?: number;
    user_ratings_total?: number;
  };
};

function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || undefined;
}

/** Only used when Places status !== "OK" or the request fails. */
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
): Promise<GooglePlaceDetailsResponse["result"] | null> {
  const fields = [
    "name",
    "formatted_address",
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
  console.log("Google Places Result:", body.result || body);

  if (body.status !== "OK" || !body.result) {
    console.error(
      "Google Place Details status:",
      body.status,
      body.error_message || "",
    );
    return null;
  }

  return body.result;
}

/**
 * Text Search → Place Details for real address, phone, and rating.
 * Fallback ONLY when Places returns status !== "OK" or the request fails.
 */
export async function lookupBusinessPlace(
  input: PlacesLookupInput,
): Promise<PlacesLookupResult> {
  const apiKey = getApiKey();
  const city = input.city.trim();
  const businessName = input.businessName.trim();

  if (!apiKey) {
    console.error(
      "GOOGLE_PLACES_API_KEY is missing — using fallback Places values.",
    );
    return fallbackPlacesResult(city);
  }

  if (!businessName || !city) {
    return fallbackPlacesResult(city);
  }

  // Exact query shape requested for Text Search.
  const query = `${businessName} ${city}`;
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
      console.error(
        "Google Places Text Search HTTP error:",
        searchResponse.status,
      );
      return fallbackPlacesResult(city);
    }

    const searchBody =
      (await searchResponse.json()) as GoogleTextSearchResponse;

    console.log("Google Places Text Search:", {
      query,
      status: searchBody.status,
      error_message: searchBody.error_message,
      topResult: searchBody.results?.[0]
        ? {
            name: searchBody.results[0].name,
            place_id: searchBody.results[0].place_id,
            formatted_address: searchBody.results[0].formatted_address,
          }
        : null,
    });

    // Fallback only when status is not OK (includes ZERO_RESULTS / REQUEST_DENIED).
    if (searchBody.status !== "OK") {
      console.error(
        "Google Places Text Search status:",
        searchBody.status,
        searchBody.error_message || "",
      );
      if (
        searchBody.status === "REQUEST_DENIED" &&
        String(searchBody.error_message || "")
          .toLowerCase()
          .includes("referer")
      ) {
        console.error(
          "GOOGLE_PLACES_API_KEY has HTTP referer restrictions. " +
            "Server-side /api/preview-ai needs a server key " +
            "(IP restriction or unrestricted) with Places API enabled.",
        );
      }
      return fallbackPlacesResult(city);
    }

    const top = searchBody.results?.[0];
    const placeId = top?.place_id?.trim();
    if (!top || !placeId) {
      console.error("Google Places Text Search OK but missing place_id");
      return fallbackPlacesResult(city);
    }

    const details = await fetchPlaceDetails(placeId, apiKey);
    if (!details) {
      return fallbackPlacesResult(city);
    }

    const address =
      details.formatted_address?.trim() ||
      top.formatted_address?.trim() ||
      `${city}, UK`;

    const phone =
      details.formatted_phone_number?.trim() ||
      details.international_phone_number?.trim() ||
      null;

    const rating =
      typeof details.rating === "number"
        ? details.rating
        : typeof top.rating === "number"
          ? top.rating
          : null;

    const userRatingsTotal =
      typeof details.user_ratings_total === "number"
        ? details.user_ratings_total
        : typeof top.user_ratings_total === "number"
          ? top.user_ratings_total
          : null;

    console.log("Google Places mapped fields:", {
      placeId,
      address,
      phone,
      rating,
      userRatingsTotal,
    });

    return {
      name: details.name?.trim() || top.name?.trim() || null,
      formattedAddress: address,
      phoneNumber: phone,
      rating,
      userRatingsTotal,
      placeId,
      fromGoogle: true,
    };
  } catch (err) {
    console.error("Google Places lookup failed:", err);
    return fallbackPlacesResult(city);
  }
}
