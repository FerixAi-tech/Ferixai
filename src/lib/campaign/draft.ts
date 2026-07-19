import type { PricingPlanSlug } from "@/lib/constants/pricing-plans";
import { DEFAULT_PLAN_SLUG } from "@/lib/constants/pricing-plans";

export interface CampaignDraft {
  businessName: string;
  category: string;
  productDescription: string;
  city: string;
  planSlug: PricingPlanSlug;
  step: 1 | 2 | 3;
  updatedAt: number;
  promoCode?: string;
  /** @deprecated legacy drafts only */
  dailyBudget?: number;
  /** @deprecated legacy drafts only */
  days?: number;
}

const STORAGE_KEY = "ferixai_campaign_draft_v1";
const STORAGE_PREFIX = "ferixai_";

export function loadCampaignDraft(): CampaignDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CampaignDraft;
    if (!parsed.planSlug) {
      parsed.planSlug = DEFAULT_PLAN_SLUG;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveCampaignDraft(draft: CampaignDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota errors
  }
}

export function clearCampaignDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Clears campaign wizard draft and any other FerixAI client session keys. */
export function clearWizardSessionState(): void {
  if (typeof window === "undefined") return;

  try {
    const localKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) localKeys.push(key);
    }
    localKeys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // ignore
  }

  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) sessionKeys.push(key);
    }
    sessionKeys.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
}

/** FX30-XXXXX — 5 unique alphanumeric chars (excludes ambiguous 0/O/1/I). */
export function generateUniquePromoCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const length = 5;
  const bytes = new Uint8Array(length);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let suffix = "";
  for (let i = 0; i < length; i += 1) {
    suffix += alphabet[bytes[i]! % alphabet.length];
  }

  return `FX30-${suffix}`;
}
