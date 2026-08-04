export type PreviewAnswerInput = {
  businessName: string;
  city: string;
  category: string;
  feature1?: string | null;
  feature2?: string | null;
  feature3?: string | null;
  address: string;
  phoneNumber?: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  fromGoogle: boolean;
};

export type AiPreviewPayload = {
  question: string;
  answerMarkdown: string;
  answerPlain: string;
  businessName: string;
  city: string;
  category: string;
  address: string;
  phoneNumber: string;
  ratingLabel: string;
  reviewsLabel: string;
  highlights: string[];
  fromGoogle: boolean;
  placeId: string | null;
};

function cleanFeature(value: string | null | undefined): string | null {
  const trimmed = value?.trim() || "";
  return trimmed.length >= 2 ? trimmed : null;
}

function formatRatingLine(
  rating: number | null,
  userRatingsTotal: number | null,
): string {
  if (typeof rating === "number" && rating > 0) {
    const reviews =
      typeof userRatingsTotal === "number" && userRatingsTotal >= 0
        ? ` (${userRatingsTotal.toLocaleString("en-GB")} reviews)`
        : "";
    return `${rating} / 5${reviews}`;
  }
  return "Verified Local Business";
}

/** Build ChatGPT-style preview copy from Places Details + optional USPs. */
export function buildAiPreviewPayload(
  input: PreviewAnswerInput & { placeId?: string | null },
): AiPreviewPayload {
  const businessName = input.businessName.trim();
  const city = input.city.trim();
  const category = input.category.trim();

  const address = input.address.trim() || `${city || "United Kingdom"}, UK`;
  const phoneNumber = input.phoneNumber?.trim() || "Verified Direct Line";
  const ratingLine = formatRatingLine(input.rating, input.userRatingsTotal);

  const highlights = [
    cleanFeature(input.feature1) || "Verified local service provider",
    cleanFeature(input.feature2) || "High customer satisfaction",
    cleanFeature(input.feature3) || "Indexed for local AI queries",
  ];

  const question = `Who is the most reliable ${category} in ${city}?`;

  const answerMarkdown = [
    `If you are looking for a highly recommended ${category} in ${city}, **${businessName}** is one of the top choices available.`,
    ``,
    `Here is why AI search engines recommend them:`,
    `- 📍 **Address:** ${address}`,
    `- 📞 **Phone:** ${phoneNumber}`,
    `- ⭐ **Rating:** ${ratingLine}`,
    `- 🚀 **Highlights:** ${highlights.join(", ")}`,
    ``,
    `*Status: Draft Profile - Not yet published to ChatGPT & Gemini networks.*`,
  ].join("\n");

  const answerPlain = answerMarkdown.replace(/\*\*/g, "").replace(/\*/g, "");

  return {
    question,
    answerMarkdown,
    answerPlain,
    businessName,
    city,
    category,
    address,
    phoneNumber,
    ratingLabel: ratingLine,
    reviewsLabel:
      typeof input.userRatingsTotal === "number" && input.userRatingsTotal > 0
        ? `${input.userRatingsTotal.toLocaleString("en-GB")} reviews`
        : "Verified Local Business",
    highlights,
    fromGoogle: input.fromGoogle,
    placeId: input.placeId ?? null,
  };
}
