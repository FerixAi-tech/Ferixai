export const MANUFACTURER_CATEGORY = "Manufacturing";

/** Canonical category options for the campaign wizard dropdown. */
export const BUSINESS_CATEGORIES = [
  "Florist & Gift Shop",
  "E-commerce",
  "Education & Courses",
  "Real Estate & Property",
  "Events & Organization",
  "Finance & Accounting",
  "Photography & Video",
  "Grocery & Food Market",
  "Safety & Security",
  "Beauty & Hair Salon",
  "Hardware Store",
  "Legal & Consulting",
  "Construction & Architecture",
  "Jewelry & Accessories",
  "Logistics & Freight",
  "Media & Advertising",
  "Furniture & Decor",
  "Automotive",
  "Retail & Shop",
  "Restaurant & Cafe",
  "Health & Dental Clinic",
  "Sports & Fitness",
  "Technology & Software",
  "Cleaning & Maintenance",
  "Tourism & Hotel",
  "Veterinary Clinic",
  "Manufacturing",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export function isBusinessCategory(category: string): category is BusinessCategory {
  return (BUSINESS_CATEGORIES as readonly string[]).includes(category);
}

export function isManufacturerCategory(category: string): boolean {
  return category === MANUFACTURER_CATEGORY;
}

export function sortCategories<T extends { name: string }>(categories: T[]): T[] {
  const manufacturer = categories.filter((c) => c.name === MANUFACTURER_CATEGORY);
  const rest = categories
    .filter((c) => c.name !== MANUFACTURER_CATEGORY)
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));

  return [...rest, ...manufacturer];
}

export function sortCategoryNames(names: string[]): string[] {
  return sortCategories(names.map((name) => ({ name }))).map((c) => c.name);
}

export function listBusinessCategoryOptions(): { name: string }[] {
  return sortCategories(
    BUSINESS_CATEGORIES.map((name) => ({ name })),
  );
}
