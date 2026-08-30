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

type PlacesNewSearchResponse = {
  places?: Array<{
    id?: string;
    name?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    rating?: number;
    userRatingCount?: number;
  }>;
  error?: { message?: string; status?: string };
};

function getApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || undefined;
}

/** Only used when Places fails or returns no usable result. */
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

/**
 * Google Places API (New) — Text Search via places:searchText.
 * Returns address, phone, and rating in one authorized call.
 * Legacy maps.googleapis.com Place Text Search is blocked for many modern keys.
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

  const textQuery = `${businessName} ${city}`;
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.rating",
    "places.userRatingCount",
  ].join(",");

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        body: JSON.stringify({
          textQuery,
          languageCode: "en",
          regionCode: "GB",
          maxResultCount: 5,
        }),
      },
    );

    const body = (await response.json().catch(() => ({}))) as PlacesNewSearchResponse;

    if (!response.ok) {
      console.error("Google Places (New) HTTP error:", response.status, body);
      return fallbackPlacesResult(city);
    }

    const top = body.places?.[0];
    console.log("Google Places Result:", top || body);

    if (!top) {
      console.error("Google Places (New) returned no places for:", textQuery);
      return fallbackPlacesResult(city);
    }

    const placeId =
      top.id?.trim() ||
      (top.name?.startsWith("places/")
        ? top.name.replace(/^places\//, "").trim()
        : null);

    // Optional Place Details (New) enrichment when search omits phone/address.
    let details = top;
    if (
      placeId &&
      (!top.formattedAddress ||
        !(top.nationalPhoneNumber || top.internationalPhoneNumber))
    ) {
      const detailMask = [
        "id",
        "displayName",
        "formattedAddress",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
        "rating",
        "userRatingCount",
      ].join(",");

      const detailResponse = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": detailMask,
          },
        },
      );

      if (detailResponse.ok) {
        const detailBody = (await detailResponse.json()) as NonNullable<
          PlacesNewSearchResponse["places"]
        >[number];
        console.log("Google Places Result:", detailBody);
        details = { ...top, ...detailBody };
      } else {
        console.error(
          "Google Place Details (New) HTTP error:",
          detailResponse.status,
        );
      }
    }

    const address =
      details.formattedAddress?.trim() || `${city}, UK`;
    const phone =
      details.nationalPhoneNumber?.trim() ||
      details.internationalPhoneNumber?.trim() ||
      null;
    const rating =
      typeof details.rating === "number" ? details.rating : null;
    const userRatingsTotal =
      typeof details.userRatingCount === "number"
        ? details.userRatingCount
        : null;

    console.log("Google Places mapped fields:", {
      placeId,
      address,
      phone,
      rating,
      userRatingsTotal,
    });

    return {
      name: details.displayName?.text?.trim() || null,
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

export type PlacesAutocompleteSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

type PlacesAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
};

type PlaceDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
};

function normalizePlaceId(placeId: string): string {
  return placeId.replace(/^places\//, "").trim();
}

export function extractCityFromAddressComponents(
  components: PlaceDetailsResponse["addressComponents"],
): string {
  if (!components?.length) return "United Arab Emirates";

  const priority = [
    "locality",
    "postal_town",
    "administrative_area_level_2",
    "administrative_area_level_1",
  ];

  for (const type of priority) {
    const match = components.find((component) => component.types?.includes(type));
    if (match?.longText?.trim()) {
      return match.longText.trim();
    }
  }

  return "United Arab Emirates";
}

export async function autocompletePlacesUae(
  input: string,
): Promise<PlacesAutocompleteSuggestion[]> {
  const apiKey = getApiKey();
  const query = input.trim();

  if (!apiKey || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify({
          input: query,
          includedRegionCodes: ["AE"],
          languageCode: "en",
        }),
      },
    );

    const body = (await response.json().catch(() => ({}))) as PlacesAutocompleteResponse;

    if (!response.ok) {
      console.error("Google Places autocomplete error:", response.status, body);
      return [];
    }

    return (body.suggestions ?? [])
      .map((suggestion) => {
        const prediction = suggestion.placePrediction;
        if (!prediction) return null;

        const placeId = prediction.placeId?.trim();
        if (!placeId) return null;

        const mainText =
          prediction.structuredFormat?.mainText?.text?.trim() ||
          prediction.text?.text?.trim() ||
          "";
        const secondaryText =
          prediction.structuredFormat?.secondaryText?.text?.trim() || "";
        const label = prediction.text?.text?.trim() || mainText;

        if (!label) return null;

        return {
          placeId: normalizePlaceId(placeId),
          label,
          mainText: mainText || label,
          secondaryText,
        };
      })
      .filter((item): item is PlacesAutocompleteSuggestion => item !== null)
      .slice(0, 6);
  } catch (err) {
    console.error("Google Places autocomplete failed:", err);
    return [];
  }
}

export async function getPlaceDetailsById(
  placeId: string,
): Promise<PlacesLookupResult & { city: string }> {
  const apiKey = getApiKey();
  const normalizedId = normalizePlaceId(placeId);

  if (!apiKey || !normalizedId) {
    return { ...fallbackPlacesResult("United Arab Emirates"), city: "United Arab Emirates" };
  }

  const detailMask = [
    "id",
    "displayName",
    "formattedAddress",
    "nationalPhoneNumber",
    "internationalPhoneNumber",
    "rating",
    "userRatingCount",
    "addressComponents",
  ].join(",");

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(normalizedId)}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": detailMask,
        },
      },
    );

    const body = (await response.json().catch(() => ({}))) as PlaceDetailsResponse;

    if (!response.ok) {
      console.error("Google Place Details error:", response.status, body);
      return { ...fallbackPlacesResult("United Arab Emirates"), city: "United Arab Emirates" };
    }

    const city = extractCityFromAddressComponents(body.addressComponents);
    const address =
      body.formattedAddress?.trim() || `${city}, United Arab Emirates`;
    const phone =
      body.nationalPhoneNumber?.trim() ||
      body.internationalPhoneNumber?.trim() ||
      null;

    return {
      name: body.displayName?.text?.trim() || null,
      formattedAddress: address,
      phoneNumber: phone,
      rating: typeof body.rating === "number" ? body.rating : null,
      userRatingsTotal:
        typeof body.userRatingCount === "number" ? body.userRatingCount : null,
      placeId: normalizedId,
      fromGoogle: true,
      city,
    };
  } catch (err) {
    console.error("Google Place Details failed:", err);
    return { ...fallbackPlacesResult("United Arab Emirates"), city: "United Arab Emirates" };
  }
}
