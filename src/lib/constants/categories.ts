export const MANUFACTURER_CATEGORY = "Manufacturer";

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
