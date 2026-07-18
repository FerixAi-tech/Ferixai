import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/constants/urls";

export default function robots(): MetadataRoute.Robots {
  const base = getAppBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/auth", "/om-admin-panel", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
