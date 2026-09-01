import { createAdminClient } from "@/lib/supabase/admin";
import AdminPanelLogoutButton from "@/components/admin/AdminPanelLogoutButton";
import AdminPanelNav from "@/components/admin/AdminPanelNav";

type AuditCompetitorRow = {
  name?: string;
  subtitle?: string;
};

type AuditSimulationRow = {
  id: string;
  created_at: string;
  category: string;
  business_name: string;
  formatted_address: string | null;
  city: string | null;
  phone_number: string | null;
  website_uri: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  place_id: string | null;
  from_google: boolean;
  manual_entry: boolean;
  bone_question: string;
  competitors: AuditCompetitorRow[] | null;
  referrer: string | null;
  user_agent: string | null;
};

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  }).format(new Date(iso));
}

export default async function AdminAuditSimulations() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("landing_audit_simulations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as AuditSimulationRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">
            Operations
          </p>
          <h1 className="lf-orbitron mt-2 text-3xl font-bold text-white">
            AI audit searches
          </h1>
          <p className="mt-2 text-sm text-[#94a3b8]">
            Businesses searched on the landing AI Visibility Simulator.
          </p>
        </div>
        <AdminPanelLogoutButton />
      </div>

      <AdminPanelNav active="/om-admin-panel/audit-simulations" />

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Could not load audit searches. Apply the latest Supabase migration{" "}
          <code className="text-red-100">landing_audit_simulations</code>.
        </p>
      ) : null}

      <div className="space-y-4">
        {rows.map((row) => {
          const competitors = Array.isArray(row.competitors)
            ? row.competitors
            : [];

          return (
            <article key={row.id} className="lf-card-surface p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white">
                    {row.business_name}
                  </h2>
                  <p className="text-sm text-[#94a3b8]">
                    {row.category}
                    {row.city ? ` · ${row.city}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {formatWhen(row.created_at)}
                    {row.manual_entry ? " · Manual entry" : " · Google Maps"}
                  </p>
                </div>
                <div className="shrink-0 text-sm text-[#94a3b8]">
                  {row.google_rating != null
                    ? `${Number(row.google_rating).toFixed(1)} ★`
                    : "No rating"}
                  {row.google_review_count != null
                    ? ` · ${row.google_review_count} reviews`
                    : ""}
                </div>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-[#64748b]">
                    Address
                  </dt>
                  <dd className="mt-1 text-[#cbd5e1]">
                    {row.formatted_address || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-[#64748b]">
                    Phone
                  </dt>
                  <dd className="mt-1 text-[#cbd5e1]">
                    {row.phone_number || "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.12em] text-[#64748b]">
                    Website
                  </dt>
                  <dd className="mt-1 text-[#cbd5e1]">
                    {row.website_uri ? (
                      <a
                        href={row.website_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-300 hover:underline"
                      >
                        {row.website_uri}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.12em] text-[#64748b]">
                    Bone question
                  </dt>
                  <dd className="mt-1 italic text-emerald-100/90">
                    &quot;{row.bone_question}&quot;
                  </dd>
                </div>
                {competitors.length > 0 ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-[0.12em] text-[#64748b]">
                      Competitors shown
                    </dt>
                    <dd className="mt-1 text-[#cbd5e1]">
                      {competitors
                        .map((item) => item.name)
                        .filter(Boolean)
                        .join(" · ")}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </article>
          );
        })}

        {!error && rows.length === 0 ? (
          <p className="text-sm text-[#94a3b8]">No audit searches recorded yet.</p>
        ) : null}
      </div>
    </div>
  );
}
