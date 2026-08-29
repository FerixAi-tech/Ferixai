import { NL_CITIES, type NlCity } from "@/lib/constants/cities";

/** Notable streets / business areas per Dutch city (Step 3 invoice dropdown). */
export const CITY_STREET_AREAS: Record<NlCity, readonly string[]> = {
  Almere: [
    "Almere Buiten",
    "Almere Centrum",
    "Almere Haven",
    "Almere Poort",
    "Almere Stad",
    "Literaturwijk",
    "Oosterwold",
    "RegioPark",
  ],
  Amersfoort: [
    "Amersfoort Centrum",
    "Bergkwartier",
    "Binnenstad",
    "De Hoef",
    "Kattenbroek",
    "Liendert",
    "Schothorst",
    "Vathorst",
  ],
  Amsterdam: [
    "Amsterdam Centrum",
    "De Pijp",
    "IJburg",
    "Jordaan",
    "Noord",
    "Oost",
    "Sloterdijk",
    "West",
    "Zuid",
    "Zuidas",
  ],
  Apeldoorn: [
    "Apeldoorn Centrum",
    "De Maten",
    "Osseveld",
    "Presikhaaf",
    "Stadscentrum",
    "Ugchelen",
    "Zuidbroek",
  ],
  Arnhem: [
    "Arnhem Centrum",
    "Arnhem-Noord",
    "Arnhem-Zuid",
    "Malburgen",
    "Presikhaaf",
    "Schaarsbergen",
    "Velperweg",
  ],
  Breda: [
    "Breda Centrum",
    "Breda-Noord",
    "Ginneken",
    "Haagse Beemden",
    "Hoge Vucht",
    "Prinsenbeek",
    "Teteringen",
  ],
  Delft: [
    "Binnenstad",
    "Delfgauw",
    "Delft Centrum",
    "Hof van Delft",
    "Tanthof",
    "Voorhof",
    "Wippolder",
  ],
  Eindhoven: [
    "Centrum",
    "Gestel",
    "High Tech Campus Area",
    "Strijp-S",
    "Stratum",
    "Tongelre",
    "Woensel",
  ],
  Enschede: [
    "Centrum",
    "Enschede-Oost",
    "Roombeek",
    "Stadsveld",
    "Twente",
    "Wesselerbrink",
  ],
  Groningen: [
    "Beijum",
    "Centrum",
    "Helpman",
    "Korrewegwijk",
    "Paddepoel",
    "Selwerd",
    "Zernike",
  ],
  Haarlem: [
    "Centrum",
    "Haarlem-Noord",
    "Haarlem-Oost",
    "Kleverpark",
    "Schalkwijk",
    "Spaarnwoude",
    "Te Zaanen",
  ],
  Leiden: [
    "Centrum",
    "Leiden-Noord",
    "Merenwijk",
    "Stevenshof",
    "Stevenshofdistrict",
    "Vogelwijk",
    "Willem de Zwijger",
  ],
  Maastricht: [
    "Centrum",
    "Daalhof",
    "Maastricht-Noord",
    "Randwyck",
    "Scharn",
    "Wyck",
  ],
  Nijmegen: [
    "Centrum",
    "Dukenburg",
    "Hatert",
    "Lindenholt",
    "Nijmegen-Oost",
    "Nijmegen-West",
  ],
  Rotterdam: [
    "Blaak",
    "Centrum",
    "Delfshaven",
    "Feijenoord",
    "Hillegersberg",
    "Kop van Zuid",
    "Kralingen",
    "Rotterdam-Zuid",
  ],
  "The Hague": [
    "Bezuidenhout",
    "Centrum",
    "Laak",
    "Leidschenvein",
    "Scheveningen",
    "Statenkwartier",
    "Ypenburg",
  ],
  Tilburg: [
    "Centrum",
    "Reeshof",
    "Spoorzone",
    "Tilburg-Noord",
    "Tilburg-West",
    "Tilburg-Zuid",
  ],
  Utrecht: [
    "Centrum",
    "De Uithof",
    "Leidsche Rijn",
    "Lombok",
    "Lunetten",
    "Overvecht",
    "Wittevrouwen",
  ],
  Netherlands: [
    "Amsterdam Business District",
    "Head Office — Netherlands",
    "Multi-City / Nationwide",
    "Randstad Business District",
    "Rotterdam Business District",
    "The Hague Business District",
  ],
};

export function listStreetAreasForCity(city: string): readonly string[] {
  if (city in CITY_STREET_AREAS) {
    return CITY_STREET_AREAS[city as NlCity];
  }
  return [];
}

export function isValidStreetArea(city: string, streetArea: string): boolean {
  const normalized = streetArea.trim();
  if (!normalized) return false;
  return listStreetAreasForCity(city).includes(normalized);
}

export { isNlCity, isUaeCity } from "@/lib/constants/cities";
