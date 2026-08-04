export type PreviewAnswerInput = {
  businessName: string;
  city: string;
  category: string;
  feature1?: string | null;
  feature2?: string | null;
  feature3?: string | null;
  address: string;
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

function ratingLabel(rating: number | null, fromGoogle: boolean): string {
  if (typeof rating === "number" && rating > 0) {
    return `${rating.toFixed(1)} / 5`;
  }
  return fromGoogle ? "Verified on Google" : "Verified Local Business";
}

function reviewsLabel(
  total: number | null,
  fromGoogle: boolean,
): string {
  if (typeof total === "number" && total > 0) {
    return `${total.toLocaleString("en-GB")} reviews`;
  }
  return fromGoogle ? "Google Business listing" : "Indexed for local AI queries";
}

/** Build ChatGPT-style preview copy from Places data + optional USPs. */
export function buildAiPreviewPayload(
  input: PreviewAnswerInput & { placeId?: string | null },
): AiPreviewPayload {
  const businessName = input.businessName.trim();
  const city = input.city.trim();
  const category = input.category.trim();

  const highlights = [
    cleanFeature(input.feature1) || "Verified local service provider",
    cleanFeature(input.feature2) || "High customer satisfaction",
    cleanFeature(input.feature3) || "Indexed for local AI queries",
  ];

  const rating = ratingLabel(input.rating, input.fromGoogle);
  const reviews = reviewsLabel(input.userRatingsTotal, input.fromGoogle);

  const question = `Who is the most reliable ${category} in ${city}?`;

  const answerMarkdown = [
    `If you are looking for a highly recommended ${category} in ${city}, **${businessName}** is one of the top choices available.`,
    ``,
    `Here is why AI search engines recommend them:`,
    `- 📍 **Address:** ${input.address}`,
    `- ⭐ **Rating:** ${rating} (${reviews})`,
    `- 🚀 **Highlights:** ${highlights.join(", ")}`,
    ``,
    `*Status: Draft Profile - Not yet published to ChatGPT & Gemini networks.*`,
  ].join("\n");

  const answerPlain = answerMarkdown
    .replace(/\*\*/g, "")
    .replace(/\*/g, "");

  return {
    question,
    answerMarkdown,
    answerPlain,
    businessName,
    city,
    category,
    address: input.address,
    ratingLabel: rating,
    reviewsLabel: reviews,
    highlights,
    fromGoogle: input.fromGoogle,
    placeId: input.placeId ?? null,
  };
}
