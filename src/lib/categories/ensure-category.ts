import { createAdminClient } from "@/lib/supabase/admin";
import {
  categorySlugFromName,
  isValidCategoryName,
  normalizeCategoryName,
} from "@/lib/constants/categories";

/**
 * Ensure a category row exists in Supabase (listed or custom).
 * Returns the category id.
 */
export async function ensureCategorySaved(categoryName: string): Promise<string> {
  const name = normalizeCategoryName(categoryName);
  if (!isValidCategoryName(name)) {
    throw new Error("Please enter a valid category (2–80 characters)");
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("categories")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const slug = categorySlugFromName(name);
  const { data: inserted, error } = await admin
    .from("categories")
    .insert({ name, slug })
    .select("id")
    .single();

  if (inserted?.id) return inserted.id;

  // Unique race on name or slug — fetch by name, then by slug.
  const { data: byName } = await admin
    .from("categories")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (byName?.id) return byName.id;

  const { data: bySlug } = await admin
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (bySlug?.id) return bySlug.id;

  // Slug taken by a different name — insert with suffix.
  const { data: suffixed, error: suffixError } = await admin
    .from("categories")
    .insert({ name, slug: `${slug}-${Date.now().toString(36)}` })
    .select("id")
    .single();

  if (suffixed?.id) return suffixed.id;

  throw new Error(
    suffixError?.message ||
      error?.message ||
      "Could not save category",
  );
}
