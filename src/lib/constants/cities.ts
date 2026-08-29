// Major Dutch cities. Sorted A–Z.
export const NL_CITIES = [
  "Almere",
  "Amersfoort",
  "Amsterdam",
  "Apeldoorn",
  "Arnhem",
  "Breda",
  "Delft",
  "Eindhoven",
  "Enschede",
  "Groningen",
  "Haarlem",
  "Leiden",
  "Maastricht",
  "Nijmegen",
  "Rotterdam",
  "The Hague",
  "Tilburg",
  "Utrecht",
  // Country-wide option, always last in the dropdown.
  "Netherlands",
] as const;

/** @deprecated Use NL_CITIES */
export const UAE_CITIES = NL_CITIES;

/** @deprecated Use NL_CITIES */
export const UK_CITIES = NL_CITIES;

export type NlCity = (typeof NL_CITIES)[number];

/** @deprecated Use NlCity */
export type UaeCity = NlCity;

/** @deprecated Use NlCity */
export type UkCity = NlCity;

export function isNlCity(value: string): value is NlCity {
  return (NL_CITIES as readonly string[]).includes(value);
}

/** @deprecated Use isNlCity */
export const isUaeCity = isNlCity;
