import CampaignWizard from "@/components/campaign/CampaignWizard";
import AppNav from "@/components/layout/AppNav";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: totalCampaignCount } = user
    ? await supabase
        .from("campaigns")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
    : { count: 0 };

  const campaignCount = totalCampaignCount ?? 0;
  const initialBusinessName = params.business?.trim() || "";

  return (
    <>
      <AppNav
        logoHref="/dashboard"
        backLink={{ href: "/dashboard", label: "My campaigns" }}
        right={<DashboardActions />}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {user && campaignCount > 0 && (
          <div className="mb-8 rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-sm text-teal-100">
            You already have {campaignCount} campaign
            {campaignCount === 1 ? "" : "s"}.{" "}
            <Link href="/dashboard" className="font-semibold underline">
              View all
            </Link>
          </div>
        )}

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            Create campaign
          </p>
          <h1 className="lf-orbitron mt-2 text-3xl font-bold text-white sm:text-4xl">
            New campaign
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#94a3b8]">
            Enter your business details, choose a plan intensity, and launch.
            Payment can be added later.
          </p>
        </div>

        <div className="rounded-[20px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6 shadow-[0_12px_32px_rgba(24,10,45,0.45)] sm:p-10">
          <CampaignWizard initialBusinessName={initialBusinessName} />
        </div>
      </main>
    </>
  );
}
