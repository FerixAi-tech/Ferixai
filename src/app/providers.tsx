"use client";

import PostHogProvider from "@/components/providers/PostHogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PostHogProvider>{children}</PostHogProvider>;
}
