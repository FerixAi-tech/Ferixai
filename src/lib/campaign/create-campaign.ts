import {
  generateSiteArticle,
  generateBlogArticle,
  generateDevToArticle,
} from "@/lib/ai/content-generator";
import {
  buildManufacturerBoneQuestions,
  type CampaignBrief,
} from "@/lib/ai/campaign-brief";
import type { CampaignInput } from "@/lib/campaign/validate-input";
import { isManufacturerCategory } from "@/lib/constants/categories";
import {
  calculateVisibilityMetricsForPlan,
  getCampaignContentPlanForPlan,
} from "@/lib/constants/metrics";
import { getPricingPlan, BILLING_CYCLE_DAYS } from "@/lib/constants/pricing-plans";
import { publishToDevTo } from "@/lib/devto/publish-article";
import { redeemPromoCode } from "@/lib/promo/codes";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishToWordPress } from "@/lib/wordpress/publish-post";
import { after } from "next/server";
import slugify from "slugify";

export interface CreateCampaignResult {
  campaignId: string;
  slug: string;
  title: string;
  contentUrl: string;
  wordpressUrl: string | null;
  devtoUrl: string | null;
}

function buildSlug(
  businessName: string,
  city: string,
  category: string,
  suffix = "",
): string {
  const base = slugify(`${businessName}-${city}-${category}${suffix}`, {
    lower: true,
    strict: true,
    locale: "en",
  });
  return `${base}-${Date.now().toString(36)}${suffix ? `-${suffix}` : ""}`;
}

export async function createCampaignForUser(
  userId: string,
  input: CampaignInput,
  options?: {
    onCampaignReady?: (result: {
      campaignId: string;
      slug: string;
    }) => Promise<void>;
    /**
     * Return after the campaign row exists; generate/publish content in
     * `after()`. Required for iyzico callbacks so the browser redirects
     * before OpenAI work hits the serverless timeout.
     */
    deferContent?: boolean;
  },
): Promise<CreateCampaignResult> {
  const {
    businessName,
    category,
    city,
    planSlug,
    billingCycle,
    totalCostGbp,
    promoApplied,
    promoCode,
    productDescription,
  } = input;
  const admin = createAdminClient();
  const pricingPlan = getPricingPlan(planSlug);
  const metrics = calculateVisibilityMetricsForPlan(pricingPlan, totalCostGbp);
  const contentPlan = getCampaignContentPlanForPlan(pricingPlan, totalCostGbp);
  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setDate(endsAt.getDate() + BILLING_CYCLE_DAYS);

  const { data: categoryData } = await admin
    .from("categories")
    .select("id")
    .eq("name", category)
    .single();

  let boneQuestions: string[] = [];

  if (isManufacturerCategory(category) && productDescription) {
    boneQuestions = buildManufacturerBoneQuestions(
      productDescription,
      city,
      businessName,
    );
  } else if (categoryData) {
    const { data: questions } = await admin
      .from("bone_questions")
      .select("question_text")
      .eq("category_id", categoryData.id)
      .order("sort_order");

    boneQuestions = questions?.map((q) => q.question_text) || [];
  }

  if (boneQuestions.length === 0) {
    boneQuestions = [
      `Who would you recommend for ${category} in ${city}?`,
      `Looking for a reliable ${category} business near ${city}.`,
      `What do people think of ${businessName}?`,
    ];
  }

  const brief: CampaignBrief = {
    businessName,
    category,
    city,
    boneQuestions: boneQuestions.slice(0, contentPlan.boneQuestionDepth),
    productDescription,
  };

  const slug = buildSlug(businessName, city, category);

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .insert({
      user_id: userId,
      business_name: businessName,
      category,
      city,
      product_description: productDescription,
      plan_slug: planSlug,
      billing_cycle: billingCycle,
      daily_budget: null,
      days: null,
      total_cost: totalCostGbp,
      visibility_increase: metrics.visibilityIncrease,
      status: options?.deferContent ? "generating" : "active",
      content_slug: slug,
      started_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single();

  if (campaignError || !campaign) {
    throw new Error(campaignError?.message || "Could not save campaign");
  }

  if (promoApplied && promoCode) {
    try {
      await redeemPromoCode({
        code: promoCode,
        userId,
        campaignId: campaign.id,
      });
    } catch (promoError) {
      await admin.from("campaigns").delete().eq("id", campaign.id);
      throw promoError;
    }
  }

  if (options?.onCampaignReady) {
    await options.onCampaignReady({
      campaignId: campaign.id,
      slug,
    });
  }

  const runContentPipeline = async (): Promise<CreateCampaignResult> => {
    const sitePromises = Array.from(
      { length: contentPlan.siteArticleCount },
      () => generateSiteArticle(brief),
    );
    const blogPromises =
      contentPlan.blogArticleCount > 0
        ? Array.from({ length: contentPlan.blogArticleCount }, () =>
            generateBlogArticle(brief),
          )
        : [];
    const devtoPromises =
      contentPlan.devToArticleCount > 0
        ? Array.from({ length: contentPlan.devToArticleCount }, () =>
            generateDevToArticle(brief),
          )
        : [];

    const [siteArticles, blogArticles, devtoArticles] = await Promise.all([
      Promise.all(sitePromises),
      Promise.all(blogPromises),
      Promise.all(devtoPromises),
    ]);

    const siteContent = siteArticles[0]!;

    async function insertPublishedContent(
      title: string,
      content: string,
      contentSlug: string,
    ) {
      const { error } = await admin.from("published_contents").insert({
        campaign_id: campaign.id,
        title,
        content,
        slug: contentSlug,
      });
      if (error) throw new Error(error.message);
    }

    await insertPublishedContent(siteContent.title, siteContent.content, slug);

    for (let i = 1; i < siteArticles.length; i++) {
      const extra = siteArticles[i]!;
      const extraSlug = buildSlug(businessName, city, category, `site-${i + 1}`);
      await insertPublishedContent(extra.title, extra.content, extraSlug);
    }

    let wordpressUrl: string | null = null;
    let devtoUrl: string | null = null;
    const channelPublishTasks: Promise<void>[] = [];
    const primaryBlog = blogArticles[0];
    const primaryDevto = devtoArticles[0];

    if (primaryBlog) {
      channelPublishTasks.push(
        (async () => {
          try {
            const wordpressResult = await publishToWordPress({
              title: primaryBlog.title,
              content: primaryBlog.content,
              slug,
              category,
              city,
              businessName,
              productDescription,
            });
            if (wordpressResult) {
              wordpressUrl = wordpressResult.url;
              await admin
                .from("published_contents")
                .update({
                  wordpress_post_id: wordpressResult.postId,
                  wordpress_url: wordpressResult.url,
                })
                .eq("campaign_id", campaign.id)
                .eq("slug", slug);
            }
          } catch (wordpressError) {
            console.error("WordPress publish error:", wordpressError);
          }
        })(),
      );
    }

    if (primaryDevto) {
      channelPublishTasks.push(
        (async () => {
          try {
            const devtoResult = await publishToDevTo({
              title: primaryDevto.title,
              content: primaryDevto.content,
              slug,
              category,
              city,
              businessName,
              productDescription,
            });
            if (devtoResult) {
              devtoUrl = devtoResult.url;
              await admin
                .from("published_contents")
                .update({
                  devto_article_id: devtoResult.articleId,
                  devto_url: devtoResult.url,
                })
                .eq("campaign_id", campaign.id)
                .eq("slug", slug);
            }
          } catch (devtoError) {
            console.error("Dev.to publish error:", devtoError);
          }
        })(),
      );
    }

    if (channelPublishTasks.length > 0) {
      await Promise.all(channelPublishTasks);
    }

    if (!devtoUrl && primaryDevto) {
      after(async () => {
        try {
          const devtoResult = await publishToDevTo(
            {
              title: primaryDevto.title,
              content: primaryDevto.content,
              slug,
              category,
              city,
              businessName,
              productDescription,
            },
            { maxAttempts: 4 },
          );
          if (!devtoResult) return;
          await admin
            .from("published_contents")
            .update({
              devto_article_id: devtoResult.articleId,
              devto_url: devtoResult.url,
            })
            .eq("campaign_id", campaign.id)
            .eq("slug", slug);
        } catch (devtoRetryError) {
          console.error("Dev.to delayed publish error:", devtoRetryError);
        }
      });
    }

    for (let i = 1; i < blogArticles.length; i++) {
      const blogContent = blogArticles[i]!;
      const blogSlug = buildSlug(businessName, city, category, `blog-${i + 1}`);
      await insertPublishedContent(
        blogContent.title,
        blogContent.content,
        blogSlug,
      );
      try {
        await publishToWordPress({
          title: blogContent.title,
          content: blogContent.content,
          slug: blogSlug,
          category,
          city,
          businessName,
          productDescription,
        });
      } catch (wordpressError) {
        console.error("WordPress extra publish error:", wordpressError);
      }
    }

    for (let i = 1; i < devtoArticles.length; i++) {
      const devtoContent = devtoArticles[i]!;
      const devtoSlug = buildSlug(
        businessName,
        city,
        category,
        `devto-${i + 1}`,
      );
      try {
        await publishToDevTo({
          title: devtoContent.title,
          content: devtoContent.content,
          slug: devtoSlug,
          category,
          city,
          businessName,
          productDescription,
        });
      } catch (devtoError) {
        console.error("Dev.to extra publish error:", devtoError);
      }
    }

    return {
      campaignId: campaign.id,
      slug,
      title: siteContent.title,
      contentUrl: `/content/${slug}`,
      wordpressUrl,
      devtoUrl,
    };
  };

  // Paid checkout must redirect before OpenAI / channel publishing finishes,
  // otherwise Vercel timeouts leave the user stuck and iyzico may retry.
  if (options?.deferContent) {
    after(async () => {
      try {
        await runContentPipeline();
        await admin
          .from("campaigns")
          .update({ status: "active" })
          .eq("id", campaign.id);
      } catch (contentError) {
        console.error("Deferred campaign content error:", contentError);
      }
    });

    return {
      campaignId: campaign.id,
      slug,
      title: businessName,
      contentUrl: `/content/${slug}`,
      wordpressUrl: null,
      devtoUrl: null,
    };
  }

  return runContentPipeline();
}
