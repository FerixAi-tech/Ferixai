import { UAE_CITIES, type UaeCity } from "@/lib/constants/cities";

/** Notable streets / business areas per UAE emirate or city (Step 3 invoice dropdown). */
export const CITY_STREET_AREAS: Record<UaeCity, readonly string[]> = {
  "Abu Dhabi": [
    "Al Bateen",
    "Al Khalidiyah",
    "Al Markaziyah (City Centre)",
    "Al Maryah Island",
    "Al Mushrif",
    "Al Nahyan",
    "Al Reem Island",
    "Al Zahiyah (Tourist Club Area)",
    "Corniche Road",
    "Khalifa City",
    "Saadiyat Island",
    "Yas Island",
  ],
  Ajman: [
    "Al Jurf",
    "Al Nuaimiya",
    "Al Rashidiya",
    "Al Rawda",
    "Al Zahra",
    "Ajman Corniche",
    "Al Mowaihat",
    "Emirates City",
    "Hamidiya",
    "New Industrial Area",
  ],
  "Al Ain": [
    "Al Ain City Centre",
    "Al Foah",
    "Al Jimi",
    "Al Khabisi",
    "Al Mutaredh",
    "Al Qattara",
    "Al Sarooj",
    "Al Towayya",
    "Hili",
    "Zakher",
  ],
  Dibba: [
    "Dibba Al-Fujairah",
    "Dibba Al-Hisn",
    "Dibba Bay",
    "Dibba Industrial Area",
    "Dibba Port Area",
    "Fujairah Road Corridor",
  ],
  Dubai: [
    "Al Barsha",
    "Business Bay",
    "Deira",
    "Dubai Internet City",
    "Dubai Marina",
    "Downtown Dubai",
    "Jumeirah",
    "Jumeirah Lake Towers (JLT)",
    "Jebel Ali",
    "Mirdif",
    "Palm Jumeirah",
    "Sheikh Zayed Road",
  ],
  Fujairah: [
    "Al Faseel",
    "Al Gurfa",
    "Al Hayl",
    "Dibba Road Area",
    "Fujairah City Centre",
    "Fujairah Corniche",
    "Hamad Bin Abdullah Road",
    "Industrial Area",
    "Merashid",
    "Sakamkam",
  ],
  Hatta: [
    "Hatta Dam Road",
    "Hatta Heritage Village Area",
    "Hatta Hill Park Area",
    "Hatta Town Centre",
    "Hatta Wadi Hub",
    "Wadi Hatta",
  ],
  "Khor Fakkan": [
    "Al Adwani",
    "Al Haray",
    "Al Mudifi",
    "Corniche Road",
    "Hamad Bin Abdullah Road",
    "Industrial Area",
    "Khor Fakkan Port Area",
    "Luluyah",
    "Shis",
  ],
  "Madinat Zayed": [
    "Al Dhafra Region Centre",
    "Commercial District",
    "Habshan Road Area",
    "Industrial Area",
    "Liwa Street",
    "Madinat Zayed Mall Area",
    "Tarif Area",
  ],
  "Ras Al Khaimah": [
    "Al Dhait",
    "Al Hamra Village",
    "Al Jazirah Al Hamra",
    "Al Nakheel",
    "Al Qusaidat",
    "Al Rams",
    "Khuzam",
    "RAK City Centre",
    "Ras Al Khaimah Corniche",
    "Sheikh Mohammed Bin Salem Road",
  ],
  Ruwais: [
    "Industrial City Area",
    "Ruwais Housing Complex",
    "Ruwais Port Area",
    "Ruwais Refinery District",
    "Western Region Commercial Area",
  ],
  Sharjah: [
    "Al Khan",
    "Al Majaz",
    "Al Nahda",
    "Al Qasimia",
    "Al Taawun",
    "Al Zahia",
    "Industrial Area 1–6",
    "Muwaileh Commercial",
    "Sharjah City Centre",
    "University City",
  ],
  "Umm Al Quwain": [
    "Al Abrab",
    "Al Hamra",
    "Al Maidan",
    "Al Raas",
    "Al Salamah",
    "Falaj Al Mualla",
    "Industrial Area",
    "Old Town Area",
    "Umm Al Quwain Corniche",
  ],
  "United Arab Emirates": [
    "Abu Dhabi Business District",
    "Dubai Business District",
    "Multi-Emirate / Nationwide",
    "Sharjah Business District",
    "Free Zone (UAE-wide)",
    "Head Office — UAE",
  ],
};

export function listStreetAreasForCity(city: string): readonly string[] {
  if (city in CITY_STREET_AREAS) {
    return CITY_STREET_AREAS[city as UaeCity];
  }
  return [];
}

export function isValidStreetArea(city: string, streetArea: string): boolean {
  const normalized = streetArea.trim();
  if (!normalized) return false;
  return listStreetAreasForCity(city).includes(normalized);
}

export function isUaeCity(value: string): value is UaeCity {
  return (UAE_CITIES as readonly string[]).includes(value);
}
