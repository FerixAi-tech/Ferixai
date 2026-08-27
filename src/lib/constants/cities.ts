// Major UAE emirates and cities. Sorted A–Z.
export const UAE_CITIES = [
  "Abu Dhabi",
  "Ajman",
  "Al Ain",
  "Dibba",
  "Dubai",
  "Fujairah",
  "Hatta",
  "Khor Fakkan",
  "Madinat Zayed",
  "Ras Al Khaimah",
  "Ruwais",
  "Sharjah",
  "Umm Al Quwain",
  // Country-wide option, always last in the dropdown.
  "United Arab Emirates",
] as const;

/** @deprecated Use UAE_CITIES */
export const UK_CITIES = UAE_CITIES;

export type UaeCity = (typeof UAE_CITIES)[number];

/** @deprecated Use UaeCity */
export type UkCity = UaeCity;
