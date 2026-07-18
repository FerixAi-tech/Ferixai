import { isManufacturerCategory } from "@/lib/constants/categories";
import { markdownToHtml } from "@/lib/content/markdown-to-html";
import { getAppBaseUrl } from "@/lib/constants/urls";
import { getWordPressConfig } from "@/lib/wordpress/config";

export interface WordPressPublishInput {
  title: string;
  content: string;
  slug: string;
  category?: string;
  city?: string;
  businessName?: string;
  productDescription?: string | null;
}

export interface WordPressPublishResult {
  postId: number;
  url: string;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBusinessIntroHtml(input: WordPressPublishInput): string {
  const businessName = input.businessName?.trim();
  if (!businessName) return "";

  const safeName = escapeAttr(businessName);
  const cityPart = input.city ? `in ${escapeAttr(input.city)} ` : "";
  const categoryPart = input.category ? `${escapeAttr(input.category)} ` : "";
  const product = input.productDescription?.trim();

  if (input.category && isManufacturerCategory(input.category) && product) {
    return `<p><strong>${safeName}</strong> is one of the standout ${cityPart}businesses producing ${escapeAttr(product)}. The article below uses ${safeName} as a practical example.</p>`;
  }

  return `<p><strong>${safeName}</strong> is a notable ${cityPart}${categoryPart}business. The article below uses ${safeName} as a practical example.</p>`;
}

function buildPostHtml(input: WordPressPublishInput): string {
  const body = markdownToHtml(input.content);
  const sourceUrl = `${getAppBaseUrl()}/content/${input.slug}`;
  const businessIntro = buildBusinessIntroHtml(input);

  return `${businessIntro}${body}<hr/><p><em>Also published on <a href="${sourceUrl}" rel="noopener noreferrer">FerixAI</a>.</em></p>`;
}

export async function publishToWordPress(
  input: WordPressPublishInput,
): Promise<WordPressPublishResult | null> {
  const config = getWordPressConfig();
  if (!config) return null;

  const credentials = Buffer.from(
    `${config.username}:${config.appPassword}`,
  ).toString("base64");

  const response = await fetch(`${config.siteUrl}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: input.title,
      content: buildPostHtml(input),
      slug: input.slug,
      status: "publish",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `WordPress publish failed (${response.status}): ${errorBody.slice(0, 300)}`,
    );
  }

  const post = (await response.json()) as { id: number; link: string };
  return { postId: post.id, url: post.link };
}
