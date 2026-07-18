"use client";

import { useEffect } from "react";
import { clearWizardSessionState } from "@/lib/campaign/draft";

export default function ClearCampaignDraftOnSuccess({
  active,
}: {
  active: boolean;
}) {
  useEffect(() => {
    if (active) clearWizardSessionState();
  }, [active]);

  return null;
}
