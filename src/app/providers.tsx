"use client";

import { Suspense } from "react";
import GoogleAdsSignupSuccessTracker from "@/components/google-ads/GoogleAdsSignupSuccessTracker";
import MarketingAttributionCapture from "@/components/providers/MarketingAttributionCapture";
import PostHogProvider from "@/components/providers/PostHogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingAttributionCapture />
      <Suspense fallback={null}>
        <GoogleAdsSignupSuccessTracker />
      </Suspense>
      <PostHogProvider>{children}</PostHogProvider>
    </>
  );
}
