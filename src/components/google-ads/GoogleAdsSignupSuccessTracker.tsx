"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GOOGLE_ADS_SIGNUP_QUERY_KEY,
  GOOGLE_ADS_SIGNUP_QUERY_VALUE,
  trackGoogleAdsSignup,
} from "@/lib/google-ads/conversion";

/**
 * Backup Sign-up conversion if the pre-redirect event was cancelled.
 * Deduped by user id in localStorage. No-ops until SIGNUP_LABEL is set.
 */
export default function GoogleAdsSignupSuccessTracker() {
  const searchParams = useSearchParams();
  const startedRef = useRef(false);

  useEffect(() => {
    if (
      searchParams.get(GOOGLE_ADS_SIGNUP_QUERY_KEY) !==
      GOOGLE_ADS_SIGNUP_QUERY_VALUE
    ) {
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      void trackGoogleAdsSignup({
        userId: user.id,
        email: user.email ?? undefined,
      });
    });
  }, [searchParams]);

  return null;
}
