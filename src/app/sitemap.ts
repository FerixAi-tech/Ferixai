import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/constants/urls";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppBaseUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/auth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("published_contents")
      .select("slug, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    for (const row of data || []) {
      entries.push({
        url: `${base}/content/${row.slug}`,
        lastModified: row.created_at ? new Date(row.created_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // sitemap still works without DB
  }

  return entries;
}
