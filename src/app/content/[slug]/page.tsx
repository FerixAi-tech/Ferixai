import { createClient } from "@/lib/supabase/server";
import { markdownToHtml } from "@/lib/content/markdown-to-html";
import AppNav from "@/components/layout/AppNav";
import FuturisticShell from "@/components/layout/FuturisticShell";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("published_contents")
    .select("title, content")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Content · FerixAI" };

  return {
    title: `${data.title} · FerixAI`,
    description: data.content.slice(0, 160),
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: content } = await supabase
    .from("published_contents")
    .select("*, campaigns(business_name, category, city)")
    .eq("slug", slug)
    .maybeSingle();

  if (!content) notFound();

  const campaign = Array.isArray(content.campaigns)
    ? content.campaigns[0]
    : content.campaigns;

  const html = markdownToHtml(content.content);

  return (
    <FuturisticShell>
      <AppNav logoHref="/" />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          {campaign?.category && (
            <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-teal-200">
              {campaign.category}
            </span>
          )}
          {campaign?.city && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#94a3b8]">
              {campaign.city}
            </span>
          )}
          {campaign?.business_name && (
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-indigo-200">
              {campaign.business_name}
            </span>
          )}
        </div>

        <h1 className="lf-orbitron text-3xl font-bold text-white sm:text-4xl">
          {content.title}
        </h1>

        <article
          className="prose prose-invert mt-8 max-w-none text-[#cbd5e1] [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_p]:leading-relaxed [&_strong]:text-white"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </FuturisticShell>
  );
}
