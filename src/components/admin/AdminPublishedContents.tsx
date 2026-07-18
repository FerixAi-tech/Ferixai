import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/constants/metrics";
import AdminPanelLogoutButton from "@/components/admin/AdminPanelLogoutButton";
import Link from "next/link";

export default async function AdminPublishedContents() {
  const admin = createAdminClient();

  const { data: campaigns } = await admin
    .from("campaigns")
    .select(
      "id, business_name, category, city, daily_budget, days, total_cost, status, content_slug, created_at, user_id, published_contents(title, slug, wordpress_url, devto_url)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const userIds = [...new Set((campaigns || []).map((c) => c.user_id))];
  const { data: profiles } = userIds.length
    ? await admin
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] };

  const profileMap = new Map(
    (profiles || []).map((profile) => [profile.id, profile]),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">
            Operations
          </p>
          <h1 className="lf-orbitron mt-2 text-3xl font-bold text-white">
            Published campaigns
          </h1>
        </div>
        <AdminPanelLogoutButton />
      </div>

      <div className="space-y-4">
        {(campaigns || []).map((campaign) => {
          const profile = profileMap.get(campaign.user_id);
          const contents = Array.isArray(campaign.published_contents)
            ? campaign.published_contents
            : campaign.published_contents
              ? [campaign.published_contents]
              : [];

          return (
            <article key={campaign.id} className="lf-card-surface p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {campaign.business_name}
                  </h2>
                  <p className="text-sm text-[#94a3b8]">
                    {campaign.category} · {campaign.city}
                  </p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {profile?.full_name || "—"} · {profile?.email || "—"}
                  </p>
                </div>
                <div className="text-sm text-[#94a3b8]">
                  {formatCurrency(Number(campaign.total_cost))} ·{" "}
                  {campaign.days} days · {campaign.status}
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                {contents.map((content) => (
                  <li key={content.slug} className="text-[#cbd5e1]">
                    <Link
                      href={`/content/${content.slug}`}
                      className="text-teal-300 hover:underline"
                    >
                      {content.title}
                    </Link>
                    {content.wordpress_url && (
                      <>
                        {" · "}
                        <a
                          href={content.wordpress_url}
                          className="text-[#94a3b8] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          WordPress
                        </a>
                      </>
                    )}
                    {content.devto_url && (
                      <>
                        {" · "}
                        <a
                          href={content.devto_url}
                          className="text-[#94a3b8] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Dev.to
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}

        {(!campaigns || campaigns.length === 0) && (
          <p className="text-sm text-[#94a3b8]">No campaigns yet.</p>
        )}
      </div>
    </div>
  );
}
