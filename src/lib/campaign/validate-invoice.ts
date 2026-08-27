import {
  isUaeCity,
  isValidStreetArea,
} from "@/lib/constants/city-streets";

export interface InvoiceDetailsInput {
  businessName: string;
  email: string;
  emirateCity: string;
  streetArea: string;
  trnNumber: string | null;
}

const TRN_MAX_LENGTH = 20;

export function validateInvoiceDetails(body: unknown): InvoiceDetailsInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invoice details are required");
  }

  const {
    businessName,
    email,
    emirateCity,
    streetArea,
    trnNumber,
  } = body as Record<string, unknown>;

  const name = String(businessName ?? "").trim();
  if (name.length < 2) {
    throw new Error("Business name must be at least 2 characters");
  }
  if (name.length > 120) {
    throw new Error("Business name must be 120 characters or fewer");
  }

  const normalizedEmail = String(email ?? "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("A valid email address is required");
  }

  const city = String(emirateCity ?? "").trim();
  if (!city || !isUaeCity(city)) {
    throw new Error("Please select a valid emirate or city");
  }

  const street = String(streetArea ?? "").trim();
  if (!street) {
    throw new Error("Please select a street or area address");
  }
  if (!isValidStreetArea(city, street)) {
    throw new Error("Please select a valid street or area for your city");
  }

  const trnRaw =
    trnNumber === undefined || trnNumber === null
      ? ""
      : String(trnNumber).trim();
  if (trnRaw.length > TRN_MAX_LENGTH) {
    throw new Error("TRN number must be 20 characters or fewer");
  }

  return {
    businessName: name,
    email: normalizedEmail,
    emirateCity: city,
    streetArea: street,
    trnNumber: trnRaw || null,
  };
}
