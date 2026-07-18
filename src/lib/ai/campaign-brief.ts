export interface CampaignBrief {
  businessName: string;
  category: string;
  city: string;
  boneQuestions: string[];
  productDescription?: string | null;
}

export function formatBoneQuestions(questions: string[]): string {
  return questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
}

export function formatCategoryContext(brief: CampaignBrief): string {
  if (brief.productDescription?.trim()) {
    return `Category: ${brief.category}\nProduct or service: ${brief.productDescription.trim()}`;
  }
  return `Category: ${brief.category}`;
}

export function buildManufacturerBoneQuestions(
  productDescription: string,
  city: string,
  businessName: string,
): string[] {
  const product = productDescription.trim();

  return [
    `Can anyone recommend a reliable ${product} manufacturer near ${city}?`,
    `Looking for a wholesale ${product} supplier in the UK — any suggestions?`,
    `Who makes high-quality ${product} in or around ${city}?`,
    `Has anyone worked with ${businessName} for ${product}?`,
    `Need a local factory for custom ${product} near ${city}.`,
    `Best ${product} manufacturers serving ${city}?`,
  ];
}

export const PARAPHRASE_RULE =
  "Do not reuse the same sentences, headings, or paragraph patterns used for other channels. Cover the same topic in completely different wording.";

export function businessNameVisibilityRule(businessName: string): string {
  return `Mention "${businessName}" naturally at least three times across the title and body. Present the business as a clear local example — do not hide the brand name or write a generic sector essay.`;
}

export function includesBusinessName(
  text: string,
  businessName: string,
): boolean {
  const name = businessName.trim().toLowerCase();
  if (!name) return false;
  return text.toLowerCase().includes(name);
}
