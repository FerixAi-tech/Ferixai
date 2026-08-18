import { DEFAULT_PLAN_SLUG } from "@/lib/constants/pricing-plans";
import {
  emptyKeyFeatures,
  saveCampaignDraft,
  type CampaignDraft,
} from "@/lib/campaign/draft";

export type LeadMagnetInput = {
  businessName: string;
  category: string;
  city: string;
};

const LEAD_KEY = "ferixai_lead_magnet_v1";

export function loadLeadMagnetInput(): LeadMagnetInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEAD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LeadMagnetInput;
    if (
      !parsed?.businessName?.trim() ||
      !parsed?.category?.trim() ||
      !parsed?.city?.trim()
    ) {
      return null;
    }
    return {
      businessName: parsed.businessName.trim(),
      category: parsed.category.trim(),
      city: parsed.city.trim(),
    };
  } catch {
    return null;
  }
}

export function saveLeadMagnetInput(input: LeadMagnetInput): void {
  if (typeof window === "undefined") return;
  const payload: LeadMagnetInput = {
    businessName: input.businessName.trim(),
    category: input.category.trim(),
    city: input.city.trim(),
  };
  try {
    window.localStorage.setItem(LEAD_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota
  }

  // Mirror into campaign draft so /dashboard/new stays in sync.
  const draft: CampaignDraft = {
    businessName: payload.businessName,
    category: payload.category,
    productDescription: "",
    keyFeatures: emptyKeyFeatures(),
    city: payload.city,
    planSlug: DEFAULT_PLAN_SLUG,
    step: 1,
    updatedAt: Date.now(),
  };
  saveCampaignDraft(draft);
}

export function clearLeadMagnetInput(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEAD_KEY);
  } catch {
    // ignore
  }
}
