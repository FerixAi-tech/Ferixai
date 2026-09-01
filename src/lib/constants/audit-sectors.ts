import {
  isValidCategoryName,
  normalizeCategoryName,
  type BusinessCategory,
} from "@/lib/constants/categories";

export type AuditCompetitor = {
  name: string;
  subtitle: string;
};

type CategoryAuditConfig = {
  boneQuestion: (city: string) => string;
  competitors: readonly AuditCompetitor[];
};

function defaultCompetitors(category: string): readonly AuditCompetitor[] {
  return [
    {
      name: "Established UAE Market Leader",
      subtitle: `Top-rated ${category}`,
    },
    {
      name: "Verified Local Provider",
      subtitle: "Industry leader",
    },
    {
      name: "Top-Rated Competitor",
      subtitle: "Verified agency",
    },
  ] as const;
}

function defaultBoneQuestion(category: string, city: string): string {
  return `What are the most reputable ${category.toLowerCase()} providers in ${city}?`;
}

const CATEGORY_OVERRIDES: Partial<
  Record<BusinessCategory, CategoryAuditConfig>
> = {
  "Real Estate Agency / Broker": {
    boneQuestion: (city) =>
      `What are the top recommended luxury real estate brokers in ${city} with verified licensing?`,
    competitors: [
      { name: "Betterhomes", subtitle: "Industry leader" },
      { name: "Allsopp & Allsopp", subtitle: "Verified agency" },
      { name: "fam Properties", subtitle: "Premium brokerage" },
    ],
  },
  "Dental Clinic": {
    boneQuestion: (city) =>
      `Which dental clinics in ${city} have the highest patient trust and certified practitioners?`,
    competitors: [
      { name: "Versailles Dental Clinic", subtitle: "Industry leader" },
      { name: "Dr. Michael's Dental Clinic", subtitle: "Verified clinic" },
      { name: "Al Zahra Hospital Dental", subtitle: "Trusted provider" },
    ],
  },
  "Aesthetic & Plastic Surgery Clinic": {
    boneQuestion: (city) =>
      `Which aesthetic and plastic surgery clinics in ${city} are most recommended by patients?`,
    competitors: [
      { name: "CosmeSurge Hospital", subtitle: "Industry leader" },
      { name: "Kaya Skin Clinic", subtitle: "Verified clinic" },
      { name: "Euromed Clinic", subtitle: "Trusted provider" },
    ],
  },
  "Business Setup & Corporate Services": {
    boneQuestion: (city) =>
      `Can you suggest the most reliable business setup firms in ${city}?`,
    competitors: [
      { name: "Virtuzone", subtitle: "Industry leader" },
      { name: "Shuraa Business Setup", subtitle: "Verified agency" },
      { name: "Commitbiz", subtitle: "Trusted provider" },
    ],
  },
  "Law Firm & Legal Services": {
    boneQuestion: (city) =>
      `Which corporate law firms in ${city} are best for business and licensing matters?`,
    competitors: [
      { name: "Al Tamimi & Company", subtitle: "Legal authority" },
      { name: "Hadef & Partners", subtitle: "Industry leader" },
      { name: "BSA Ahmad Bin Hezeem", subtitle: "Verified firm" },
    ],
  },
  "Luxury Car Rental": {
    boneQuestion: (city) =>
      `Top-rated luxury car rental services in ${city} with transparent pricing?`,
    competitors: [
      { name: "Diamond Lease", subtitle: "Industry leader" },
      { name: "Superior Car Rental", subtitle: "Verified fleet" },
      { name: "Rotana Star Luxury Cars", subtitle: "Premium rental" },
    ],
  },
  "Chauffeur & Luxury Transport": {
    boneQuestion: (city) =>
      `Best chauffeur and luxury transport services in ${city} for executive travel?`,
    competitors: [
      { name: "Blacklane UAE", subtitle: "Industry leader" },
      { name: "Dubai Private Chauffeur", subtitle: "Verified service" },
      { name: "Luxury Ride Dubai", subtitle: "Premium chauffeur" },
    ],
  },
  Restaurant: {
    boneQuestion: (city) =>
      `What are the best restaurants in ${city} recommended for quality and service?`,
    competitors: [
      { name: "Zuma Dubai", subtitle: "Industry leader" },
      { name: "La Petite Maison", subtitle: "Verified favorite" },
      { name: "Pierchic", subtitle: "Top-rated dining" },
    ],
  },
  Cafe: {
    boneQuestion: (city) =>
      `Which cafés in ${city} are best for specialty coffee and remote work?`,
    competitors: [
      { name: "Tom & Serg", subtitle: "Industry leader" },
      { name: "% Arabica Dubai", subtitle: "Verified café" },
      { name: "Common Grounds", subtitle: "Top-rated coffee" },
    ],
  },
  "Yacht Charter & Boat Rental": {
    boneQuestion: (city) =>
      `Top yacht charter and boat rental companies in ${city} with licensed crews?`,
    competitors: [
      { name: "Charlux Yachts", subtitle: "Industry leader" },
      { name: "Xclusive Yachts", subtitle: "Verified charter" },
      { name: "Royal Yachts", subtitle: "Premium fleet" },
    ],
  },
  "Fitness & Gym": {
    boneQuestion: (city) =>
      `Which gyms and fitness centres in ${city} are most recommended?`,
    competitors: [
      { name: "Fitness First UAE", subtitle: "Industry leader" },
      { name: "Gold's Gym Dubai", subtitle: "Verified gym" },
      { name: "Warehouse Gym", subtitle: "Top-rated training" },
    ],
  },
  "Hotel & Accommodation": {
    boneQuestion: (city) =>
      `What are the best hotels in ${city} for business and leisure stays?`,
    competitors: [
      { name: "Burj Al Arab", subtitle: "Industry leader" },
      { name: "Atlantis The Palm", subtitle: "Verified luxury" },
      { name: "Address Downtown", subtitle: "Top-rated stay" },
    ],
  },
};

export function getAuditCategoryConfig(category: string): CategoryAuditConfig {
  const normalized = normalizeCategoryName(category);
  const override = CATEGORY_OVERRIDES[normalized as BusinessCategory];

  if (override) {
    return override;
  }

  return {
    boneQuestion: (city) => defaultBoneQuestion(normalized, city),
    competitors: defaultCompetitors(normalized),
  };
}

export function isAuditCategory(value: string): boolean {
  return isValidCategoryName(value);
}

export const AUDIT_SCAN_STEPS = [
  {
    delayMs: 0,
    text: "Connecting to OpenAI GPT-4o Knowledge Graph...",
    tone: "ok" as const,
  },
  {
    delayMs: 650,
    text: "Checking Anthropic Claude & Gemini Citation Indexes...",
    tone: "ok" as const,
  },
  {
    delayMs: 1300,
    text: "Analyzing Schema.org JSON-LD LocalBusiness node...",
    tone: "warn" as const,
  },
  {
    delayMs: 1950,
    text: "Warning: Critical Entity Gap Detected.",
    tone: "error" as const,
  },
] as const;

export const AUDIT_SCAN_DURATION_MS = 2500;
