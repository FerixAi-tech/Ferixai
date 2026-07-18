import OpenAI from "openai";
import {
  type CampaignBrief,
  businessNameVisibilityRule,
  formatBoneQuestions,
  formatCategoryContext,
  includesBusinessName,
  PARAPHRASE_RULE,
} from "@/lib/ai/campaign-brief";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedChannelContent {
  title: string;
  content: string;
}

export async function generateSiteArticle(
  input: CampaignBrief,
): Promise<GeneratedChannelContent> {
  const questionsList = formatBoneQuestions(input.boneQuestions);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You write for FerixAI. Use natural British English (organise, favour, practise as a verb). Always return valid JSON.",
      },
      {
        role: "user",
        content: `CHANNEL: FerixAI site article

Business: ${input.businessName}
${formatCategoryContext(input)}
Town/city: ${input.city}

Reference questions people may ask:
${questionsList}

Task:
- Write a clear, informative article (400-600 words)
- Use Markdown with ## subheadings
- Naturally include the business name, town/city, and category
${input.productDescription ? `- Focus the article on "${input.productDescription}"\n` : ""}- Professional, readable tone for UK business readers
- Do not write as a forum thread or Q&A

JSON: { "title": "...", "content": "..." }`,
      },
    ],
  });

  return parseContentResponse(response.choices[0]?.message?.content);
}

export async function generateBlogArticle(
  input: CampaignBrief,
): Promise<GeneratedChannelContent> {
  const questionsList = formatBoneQuestions(input.boneQuestions.slice(0, 5));
  const visibilityRule = businessNameVisibilityRule(input.businessName);

  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: attempt === 1 ? 0.82 : 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a UK business blog writer for FerixAI. Always include the business name. Always return valid JSON. Use British English.",
        },
        {
          role: "user",
          content: `CHANNEL: Blog article

Business: ${input.businessName}
${formatCategoryContext(input)}
Town/city: ${input.city}

Reference topics:
${questionsList}

Task:
- Write a different title and body from the main site article
- ${PARAPHRASE_RULE}
- ${visibilityRule}
- Include "${input.businessName}" in the title
- Present the business as a practical ${input.city} example
${input.productDescription ? `- Focus on "${input.productDescription}"\n` : ""}- 280-450 words, Markdown
- Warm, practical, professional tone
${attempt > 1 ? `\nPrevious attempt failed because "${input.businessName}" was not used enough.` : ""}

JSON: { "title": "...", "content": "..." }`,
        },
      ],
    });

    const result = parseContentResponse(response.choices[0]?.message?.content);
    if (
      includesBusinessName(result.title, input.businessName) &&
      includesBusinessName(result.content, input.businessName)
    ) {
      return result;
    }
  }

  throw new Error(
    `Could not include business name "${input.businessName}" in the blog article`,
  );
}

export async function generateDevToArticle(
  input: CampaignBrief,
): Promise<GeneratedChannelContent> {
  const questionsList = formatBoneQuestions(input.boneQuestions.slice(0, 5));
  const visibilityRule = businessNameVisibilityRule(input.businessName);

  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: attempt === 1 ? 0.78 : 0.65,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write sector analysis for FerixAI. Always include the business name. Always return valid JSON. Use British English.",
        },
        {
          role: "user",
          content: `CHANNEL: Dev.to sector review

Business: ${input.businessName}
${formatCategoryContext(input)}
Town/city: ${input.city}

Reference topics:
${questionsList}

Task:
- Write a thoughtful local-market review
- ${PARAPHRASE_RULE}
- ${visibilityRule}
- Include "${input.businessName}" in the title
- Use the business as a case example without hard-sell language
${input.productDescription ? `- Focus on "${input.productDescription}"\n` : ""}- 350-550 words, Markdown with sections such as ## Market Snapshot, ## What Buyers Look For, ## Local Notes, ## Featured Business
${attempt > 1 ? `\nPrevious attempt failed because "${input.businessName}" was not used enough.` : ""}

JSON: { "title": "...", "content": "..." }`,
        },
      ],
    });

    const result = parseContentResponse(response.choices[0]?.message?.content);
    if (
      includesBusinessName(result.title, input.businessName) &&
      includesBusinessName(result.content, input.businessName)
    ) {
      return result;
    }
  }

  throw new Error(
    `Could not include business name "${input.businessName}" in the Dev.to article`,
  );
}

function parseContentResponse(
  raw: string | null | undefined,
): GeneratedChannelContent {
  if (!raw) throw new Error("Content could not be generated");

  const parsed = JSON.parse(raw) as GeneratedChannelContent;
  if (!parsed.title?.trim() || !parsed.content?.trim()) {
    throw new Error("Generated content is incomplete");
  }

  return {
    title: parsed.title.trim(),
    content: parsed.content.trim(),
  };
}

export async function generateCampaignContent(
  input: CampaignBrief,
): Promise<GeneratedChannelContent> {
  return generateSiteArticle(input);
}
