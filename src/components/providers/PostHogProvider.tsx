"use client";

import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type posthog from "posthog-js";
import { initPostHog } from "@/lib/posthog/client";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const client = initPostHog();
    if (!client || !pathname) return;

    let url = window.origin + pathname;
    const query = searchParams.toString();
    if (query) {
      url += `?${query}`;
    }

    client.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<typeof posthog | null>(null);
  const enabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());

  useEffect(() => {
    if (!enabled) return;
    setClient(initPostHog());
  }, [enabled]);

  if (!enabled || !client) {
    return children;
  }

  return (
    <PHProvider client={client}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
