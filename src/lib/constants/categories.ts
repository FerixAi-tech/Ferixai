import slugify from "slugify";

/** Kept for legacy campaigns that still store this category name. */
export const MANUFACTURER_CATEGORY = "Manufacturing";

/** Canonical category options for landing + onboarding dropdowns. */
export const BUSINESS_CATEGORIES = [
  "Accountant",
  "Aesthetic & Plastic Surgery Clinic",
  "Automotive & Garage",
  "Bakery",
  "Barber",
  "Beauty Salon",
  "Business Setup & Corporate Services",
  "Cafe",
  "Car Detailing & Wash",
  "Car Rental",
  "Chauffeur & Luxury Transport",
  "Chiropractor",
  "Cleaning Service",
  "Construction & Trades",
  "Co-working Space",
  "Day Nursery & Childcare",
  "Dental Clinic",
  "Driving School",
  "E-commerce",
  "Electrician",
  "Financial Advisor",
  "Fitness & Gym",
  "Florist",
  "Gift Shop",
  "Hair Salon",
  "Handyman",
  "Health Clinic",
  "Hotel & Accommodation",
  "Insurance Agency",
  "Interior Decor",
  "Interior Design & Fit-Out",
  "Jewelry Store",
  "Landscaping & Gardening",
  "Law Firm & Legal Services",
  "Locksmith",
  "Logistics & Transport",
  "Lounge, Bar & Nightclub",
  "Luxury Car Rental",
  "Marketing & Advertising",
  "Mortgage Broker",
  "Optician",
  "Painter & Decorator",
  "Pest Control",
  "Pet Grooming",
  "Pharmacy",
  "Photography",
  "Physiotherapist",
  "Plumber & Heating",
  "Real Estate Agency / Broker",
  "Restaurant",
  "Roofing & Guttering",
  "Security Services",
  "Software & IT Services",
  "Spa & Massage",
  "Tattoo & Piercing Studio",
  "Tutoring Service",
  "Veterinary Clinic",
  "Yacht Charter & Boat Rental",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const CUSTOM_CATEGORY_OPTION_VALUE = "__custom_category__";

export function isBusinessCategory(
  category: string,
): category is BusinessCategory {
  return (BUSINESS_CATEGORIES as readonly string[]).includes(category);
}

export function isManufacturerCategory(category: string): boolean {
  return category === MANUFACTURER_CATEGORY;
}

export function normalizeCategoryName(category: string): string {
  return category.trim().replace(/\s+/g, " ");
}

export function isValidCategoryName(category: string): boolean {
  const name = normalizeCategoryName(category);
  return name.length >= 2 && name.length <= 80;
}

export function categorySlugFromName(name: string): string {
  const base = slugify(normalizeCategoryName(name), {
    lower: true,
    strict: true,
    locale: "en",
  });
  return base || "category";
}

/** A–Z by English locale. */
export function sortCategories<T extends { name: string }>(categories: T[]): T[] {
  return [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, "en-GB", { sensitivity: "base" }),
  );
}

export function sortCategoryNames(names: string[]): string[] {
  return sortCategories(names.map((name) => ({ name }))).map((c) => c.name);
}

export function listBusinessCategoryOptions(): { name: string }[] {
  return sortCategories(
    BUSINESS_CATEGORIES.map((name) => ({ name })),
  );
}
