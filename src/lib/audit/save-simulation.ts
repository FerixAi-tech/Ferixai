import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditCompetitor } from "@/lib/constants/audit-sectors";

export type LandingAuditSimulationRecord = {
  category: string;
  businessName: string;
  formattedAddress: string | null;
  city: string | null;
  phoneNumber: string | null;
  websiteUri: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  placeId: string | null;
  fromGoogle: boolean;
  manualEntry: boolean;
  boneQuestion: string;
  competitors: readonly AuditCompetitor[];
  referrer?: string | null;
  userAgent?: string | null;
};

export async function saveLandingAuditSimulation(
  record: LandingAuditSimulationRecord,
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin.from("landing_audit_simulations").insert({
    category: record.category,
    business_name: record.businessName,
    formatted_address: record.formattedAddress,
    city: record.city,
    phone_number: record.phoneNumber,
    website_uri: record.websiteUri,
    google_rating: record.googleRating,
    google_review_count: record.googleReviewCount,
    place_id: record.placeId,
    from_google: record.fromGoogle,
    manual_entry: record.manualEntry,
    bone_question: record.boneQuestion,
    competitors: record.competitors,
    referrer: record.referrer ?? null,
    user_agent: record.userAgent ?? null,
  });

  if (error) {
    console.error("landing_audit_simulations insert failed:", error);
  }
}
