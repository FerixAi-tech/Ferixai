import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Calendar, FileText } from "lucide-react";
import { formatCurrency, getCampaignContentPlanForPlan } from "@/lib/constants/metrics";
import {
  getPricingPlan,
  isPricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import DashboardActions from "@/components/dashboard/DashboardActions";
import ClearCampaignDraftOnSuccess from "@/components/campaign/ClearCampaignDraftOnSuccess";
import CampaignLaunchStatus from "@/components/dashboard/CampaignLaunchStatus";
import MetaPaymentSuccessTracker from "@/components/meta/MetaPaymentSuccessTracker";
import AppNav from "@/components/layout/AppNav";
import SupportContact from "@/components/layout/SupportContact";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; payment?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaigns } = user
    ? await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const createdCampaign = params.created
    ? campaigns?.find((c) => c.content_slug === params.created)
    : null;

  const paymentOk = params.payment === "ok";

  const { data: publishedRow } =
    createdCampaign?.content_slug && user
      ? await supabase
          .from("published_contents")
          .select("slug")
          .eq("slug", createdCampaign.content_slug)
          .maybeSingle()
      : { data: null };

  const contentReady = Boolean(publishedRow?.slug);

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <>
      <ClearCampaignDraftOnSuccess active={Boolean(createdCampaign)} />
      <MetaPaymentSuccessTracker
        active={paymentOk}
        dedupeKey={params.created || "payment-ok"}
        payableGbp={
          createdCampaign ? Number(createdCampaign.total_cost) || 0 : 0
        }
      />
      <AppNav
        logoHref="/dashboard"
        userLabel={
          user ? profile?.full_name || user.email || undefined : undefined
        }
        right={<DashboardActions />}
      />
      <SupportContact
        variant="topRight"
        belowNav
        className="px-4 pt-3 sm:px-6 lg:px-8"
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {createdCampaign?.content_slug ? (
          <CampaignLaunchStatus
            businessName={createdCampaign.business_name}
            slug={createdCampaign.content_slug}
            paymentOk={paymentOk}
            initiallyReady={contentReady}
          />
        ) : paymentOk ? (
          <div className="lf-animate-in lf-animate-in-1 mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Payment confirmed
            </p>
            <h2 className="lf-orbitron mt-2 text-lg font-bold text-white">
              Your business is being featured🚀
            </h2>
            <p className="mt-2 text-sm text-emerald-100/90">
              Payment received. We&apos;re setting up your campaign and
              preparing content for publication.
            </p>
          </div>
        ) : null}

        <div className="lf-animate-in lf-animate-in-2 mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
              Campaign workspace
            </p>
            <h1 className="lf-orbitron mt-2 text-3xl font-bold text-white sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#94a3b8]">
              Review your campaigns, plan intensity and published content.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="lf-btn-primary relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-bold text-white"
          >
            <Plus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">New campaign</span>
          </Link>
        </div>

        {campaigns && campaigns.length > 0 ? (
          <div className="grid gap-4">
            {campaigns.map((campaign) => {
              const planSlug = isPricingPlanSlug(campaign.plan_slug)
                ? campaign.plan_slug
                : null;
              const pricingPlan = planSlug ? getPricingPlan(planSlug) : null;
              const contentPlan = pricingPlan
                ? getCampaignContentPlanForPlan(
                    pricingPlan,
                    Number(campaign.total_cost),
                  )
                : null;

              const statusLabel =
                campaign.status === "active"
                  ? "Live"
                  : campaign.status === "generating"
                    ? "Featuring…"
                    : campaign.status;

              const statusClass =
                campaign.status === "active"
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : campaign.status === "generating"
                    ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                    : "border border-white/10 bg-white/5 text-[#94a3b8]";

              return (
                <div key={campaign.id} className="lf-card-surface p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {campaign.business_name}
                      </h3>
                      <p className="text-sm text-[#94a3b8]">
                        {campaign.category} · {campaign.city}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-xs text-[#64748b]">Payable</p>
                      <p className="lf-orbitron mt-1 font-semibold text-white">
                        {formatCurrency(Number(campaign.total_cost))}
                      </p>
                      <p className="mt-1 text-[10px] text-[#64748b]">
                        First period
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="flex items-center gap-1 text-xs text-[#64748b]">
                        <FileText className="h-3 w-3" />
                        Content pieces
                      </p>
                      <p className="lf-orbitron mt-1 font-semibold text-teal-300">
                        {contentPlan?.estimatedContentPieces ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-xs text-[#64748b]">Plan</p>
                      <p className="lf-orbitron mt-1 font-semibold text-white">
                        {pricingPlan?.name ?? "Legacy"}
                      </p>
                      {pricingPlan && (
                        <p className="mt-1 text-[10px] text-[#64748b]">
                          {formatCurrency(pricingPlan.priceMonthlyGbp)}/month
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="flex items-center gap-1 text-xs text-[#64748b]">
                        <Calendar className="h-3 w-3" />
                        Billing
                      </p>
                      <p className="lf-orbitron mt-1 font-semibold capitalize text-white">
                        {campaign.billing_cycle || "monthly"}
                      </p>
                    </div>
                  </div>

                  {campaign.content_slug && campaign.status === "active" && (
                    <div className="mt-4">
                      <Link
                        href={`/content/${campaign.content_slug}`}
                        className="text-sm font-semibold text-teal-300 hover:underline"
                      >
                        Open published article →
                      </Link>
                    </div>
                  )}
                  {campaign.content_slug &&
                    campaign.status === "generating" && (
                      <p className="mt-4 text-sm text-amber-200/90">
                        Your business is being featured — content will appear
                        here shortly.
                      </p>
                    )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="lf-card-border rounded-[20px] p-[1px]">
            <div className="lf-panel p-12 text-center">
              <h3 className="lf-orbitron text-xl font-bold text-white">
                No campaigns yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[#94a3b8]">
                You haven&apos;t launched a campaign yet. Set up your business
                in a few steps — pay securely with iyzico to launch.
              </p>
              <Link
                href="/dashboard/new"
                className="lf-btn-primary relative mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-xl px-8 py-3 font-bold text-white"
              >
                <Plus className="relative z-10 h-5 w-5" />
                <span className="relative z-10">Launch your first campaign</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
