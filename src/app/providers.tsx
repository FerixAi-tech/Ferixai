"use client";

import MarketingAttributionCapture from "@/components/providers/MarketingAttributionCapture";
import PostHogProvider from "@/components/providers/PostHogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingAttributionCapture />
      <PostHogProvider>{children}</PostHogProvider>
    </>
  );
}
