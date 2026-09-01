export type AuditSectorId =
  | "real-estate"
  | "dental-aesthetic"
  | "corporate-law"
  | "luxury-transport"
  | "general";

export type AuditCompetitor = {
  name: string;
  subtitle: string;
};

export type AuditSector = {
  id: AuditSectorId;
  label: string;
  campaignCategory: string;
  boneQuestion: (city: string, customLabel?: string) => string;
  competitors: readonly AuditCompetitor[];
};

export const AUDIT_SECTORS: readonly AuditSector[] = [
  {
    id: "real-estate",
    label: "Real Estate (Property & Real Estate)",
    campaignCategory: "Real Estate Agency / Broker",
    boneQuestion: (city) =>
      `What are the top recommended luxury real estate brokers in ${city} with verified licensing?`,
    competitors: [
      { name: "Betterhomes", subtitle: "Industry leader" },
      { name: "Allsopp & Allsopp", subtitle: "Verified agency" },
      { name: "fam Properties", subtitle: "Premium brokerage" },
    ],
  },
  {
    id: "dental-aesthetic",
    label: "Dental & Aesthetic Clinics",
    campaignCategory: "Dental Clinic",
    boneQuestion: (city) =>
      `Which dental and aesthetic clinics in ${city} have the highest patient trust and certified practitioners?`,
    competitors: [
      { name: "Versailles Dental Clinic", subtitle: "Industry leader" },
      { name: "Dr. Michael's Dental Clinic", subtitle: "Verified clinic" },
      { name: "Al Zahra Hospital Dental", subtitle: "Trusted provider" },
    ],
  },
  {
    id: "corporate-law",
    label: "Corporate Law & Business Setup",
    campaignCategory: "Business Setup & Corporate Services",
    boneQuestion: (city) =>
      `Can you suggest the most reliable business setup and corporate law firms in ${city}?`,
    competitors: [
      { name: "Virtuzone", subtitle: "Industry leader" },
      { name: "Shuraa Business Setup", subtitle: "Verified agency" },
      { name: "Al Tamimi & Company", subtitle: "Legal authority" },
    ],
  },
  {
    id: "luxury-transport",
    label: "Luxury Car Rental & Chauffeur",
    campaignCategory: "Luxury Car Rental",
    boneQuestion: (city) =>
      `Top-rated luxury car rental and chauffeur services in ${city} with transparent pricing?`,
    competitors: [
      { name: "Diamond Lease", subtitle: "Industry leader" },
      { name: "Superior Car Rental", subtitle: "Verified fleet" },
      { name: "Rotana Star Luxury Cars", subtitle: "Premium chauffeur" },
    ],
  },
  {
    id: "general",
    label: "General Local Business (Other)",
    campaignCategory: "Local Business",
    boneQuestion: (city, customLabel) => {
      const label = customLabel?.trim() || "local business";
      return `What are the most reputable ${label} providers in ${city}?`;
    },
    competitors: [
      { name: "Established UAE Market Leader", subtitle: "Industry leader" },
      { name: "Verified Local Provider", subtitle: "Verified agency" },
      { name: "Top-Rated Competitor", subtitle: "High visibility" },
    ],
  },
] as const;

export function getAuditSector(id: AuditSectorId): AuditSector {
  return AUDIT_SECTORS.find((sector) => sector.id === id) ?? AUDIT_SECTORS[4]!;
}

export function isAuditSectorId(value: string): value is AuditSectorId {
  return AUDIT_SECTORS.some((sector) => sector.id === value);
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
