"use client";

import { useEffect } from "react";
import { persistMarketingAttribution } from "@/lib/analytics/marketing-attribution";
import { getPostHog } from "@/lib/posthog/client";

export default function MarketingAttributionCapture() {
  useEffect(() => {
    const attrs = persistMarketingAttribution(
      new URLSearchParams(window.location.search),
    );
    if (!attrs) return;

    const posthog = getPostHog();
    if (!posthog) return;

    const props: Record<string, string | boolean> = {
      marketing_attribution: true,
    };

    for (const [key, value] of Object.entries(attrs)) {
      if (value) props[key] = value;
    }

    posthog.register(props);
  }, []);

  return null;
}
