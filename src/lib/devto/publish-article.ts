import { isManufacturerCategory } from "@/lib/constants/categories";
import { getAppBaseUrl } from "@/lib/constants/urls";
import { getDevToApiKey } from "@/lib/devto/config";
import slugify from "slugify";

export interface DevToPublishInput {
  title: string;
  content: string;
  slug: string;
  category?: string;
  city?: string;
  businessName?: string;
  productDescription?: string | null;
}

export interface DevToPublishResult {
  articleId: number;
  url: string;
}

function sanitizeTag(value: string): string | null {
  const tag = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);
  return tag.length >= 2 ? tag : null;
}

function buildTags(category?: string, city?: string): string[] {
  const tags: string[] = [];
  if (category) {
    const tag = sanitizeTag(
      slugify(category, { lower: true, strict: true, locale: "en" }),
    );
    if (tag) tags.push(tag);
  }
  if (city) {
    const tag = sanitizeTag(
      slugify(city, { lower: true, strict: true, locale: "en" }),
    );
    if (tag) tags.push(tag);
  }
  tags.push("ferixai", "business");
  return [...new Set(tags.filter(Boolean))].slice(0, 4);
}

function buildBodyMarkdown(input: DevToPublishInput): string {
  const sourceUrl = `${getAppBaseUrl()}/content/${input.slug}`;
  let content = input.content;
  const businessName = input.businessName?.trim();

  if (
    businessName &&
    !content.toLowerCase().includes(businessName.toLowerCase())
  ) {
    const cityPart = input.city ? ` (${input.city})` : "";
    const categoryPart = input.category ? ` — ${input.category}` : "";
    const product = input.productDescription?.trim();
    const intro =
      input.category && isManufacturerCategory(input.category) && product
        ? `${businessName} is highlighted here as a manufacturer of ${product}.`
        : `${businessName} is highlighted here as a notable local business.`;
    content = `## ${businessName}${cityPart}${categoryPart}\n\n${intro}\n\n${content}`;
  }

  return `${content}\n\n---\n\n*Originally published on [FerixAI](${sourceUrl}).*`;
}

export async function publishToDevTo(
  input: DevToPublishInput,
  options?: { maxAttempts?: number },
): Promise<DevToPublishResult | null> {
  const apiKey = getDevToApiKey();
  if (!apiKey) return null;

  const maxAttempts = options?.maxAttempts ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch("https://dev.to/api/articles", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article: {
            title: input.title,
            body_markdown: buildBodyMarkdown(input),
            published: true,
            tags: buildTags(input.category, input.city),
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Dev.to publish failed (${response.status}): ${errorBody.slice(0, 300)}`,
        );
      }

      const article = (await response.json()) as { id: number; url: string };
      return { articleId: article.id, url: article.url };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error("Dev.to publish failed");
}
