export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  registration_source?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface BoneQuestion {
  id: string;
  category_id: string;
  question_text: string;
  sort_order: number | null;
}

export interface Campaign {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  city: string;
  product_description?: string | null;
  plan_slug?: string | null;
  billing_cycle?: string | null;
  /** @deprecated Unused for new monthly plans */
  daily_budget?: number | null;
  /** @deprecated Unused for new monthly plans */
  days?: number | null;
  total_cost: number;
  visibility_increase: number;
  status: "draft" | "active" | "completed" | "cancelled" | "generating";
  content_slug: string | null;
  created_at: string;
  started_at: string | null;
  ends_at: string | null;
}

export interface PublishedContent {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  slug: string;
  wordpress_post_id: number | null;
  wordpress_url: string | null;
  devto_article_id: number | null;
  devto_url: string | null;
  created_at: string;
}

export interface CampaignFormData {
  businessName: string;
  category: string;
  city: string;
  planSlug: string;
}

export interface VisibilityMetrics {
  totalCost: number;
  visibilityIncrease: number;
  estimatedReach: number;
  llmMentions: number;
  contentScore: number;
}
