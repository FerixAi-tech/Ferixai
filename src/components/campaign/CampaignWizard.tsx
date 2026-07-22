"use client";

import { useState, useEffect, useRef } from "react";
import { UK_CITIES } from "@/lib/constants/cities";
import {
  isManufacturerCategory,
  MANUFACTURER_CATEGORY,
  sortCategories,
} from "@/lib/constants/categories";
import {
  formatCurrency,
  getCampaignContentPlanForPlan,
} from "@/lib/constants/metrics";
import {
  formatCheckoutCharge,
  getIyzicoCheckoutCharge,
} from "@/lib/constants/checkout";
import { trackInitiateCheckout } from "@/lib/meta/pixel";
import {
  applyPromoDiscount,
  DEFAULT_PLAN_SLUG,
  getPricingPlan,
  isPricingPlanSlug,
  PROMO_DISCOUNT_GBP,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import MetricsPreview from "@/components/campaign/MetricsPreview";
import PricingPlanCards from "@/components/campaign/PricingPlanCards";
import { createClient } from "@/lib/supabase/client";
import {
  loadCampaignDraft,
  saveCampaignDraft,
} from "@/lib/campaign/draft";
import type { Category } from "@/lib/types";
import SignupCard from "@/components/landing/SignupCard";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  MapPin,
  Tag,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DarkSelect from "@/components/ui/DarkSelect";

type Step = 1 | 2 | 3;

export default function CampaignWizard({
  initialBusinessName = "",
}: {
  initialBusinessName?: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [pendingAfterSignup, setPendingAfterSignup] = useState<
    "step3" | "launch" | null
  >(null);

  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [category, setCategory] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [city, setCity] = useState("");
  const [planSlug, setPlanSlug] =
    useState<PricingPlanSlug>(DEFAULT_PLAN_SLUG);
  const [promoCode, setPromoCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const launchLockRef = useRef(false);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (data) setCategories(sortCategories(data));
    }
    loadCategories();
  }, [supabase]);

  useEffect(() => {
    if (draftRestored) return;
    const draft = loadCampaignDraft();
    if (!draft) {
      setStep(1);
      setCategory("");
      setProductDescription("");
      setCity("");
      setPlanSlug(DEFAULT_PLAN_SLUG);
      setPromoCode("");
      setIsApplied(false);
      setPromoError("");
      if (initialBusinessName.trim()) {
        setBusinessName(initialBusinessName.trim());
      } else {
        setBusinessName("");
      }
      setDraftRestored(true);
      return;
    }

    setBusinessName(draft.businessName || initialBusinessName);
    setCategory(draft.category);
    setProductDescription(draft.productDescription || "");
    setCity(draft.city);
    setPlanSlug(
      isPricingPlanSlug(draft.planSlug) ? draft.planSlug : DEFAULT_PLAN_SLUG,
    );
    setStep(draft.step || 1);
    setPromoCode(draft.promoCode || "");
    setIsApplied(false);
    setDraftRestored(true);
  }, [draftRestored, initialBusinessName]);

  const pricingPlan = getPricingPlan(planSlug);
  const pricing = applyPromoDiscount(
    pricingPlan.priceMonthlyGbp,
    isApplied ? PROMO_DISCOUNT_GBP : 0,
  );
  const checkoutCharge = getIyzicoCheckoutCharge(pricing.payable);
  const checkoutLabel = formatCheckoutCharge(
    checkoutCharge.amount,
    checkoutCharge.currency,
  );
  const contentPlan = getCampaignContentPlanForPlan(
    pricingPlan,
    pricing.payable,
  );
  const isManufacturer = isManufacturerCategory(category);

  function persistDraft(nextStep: Step = step) {
    const name = businessName.trim();
    if (!name && !category && !city) return;
    saveCampaignDraft({
      businessName: name,
      category,
      productDescription: isManufacturer ? productDescription.trim() : "",
      city,
      planSlug,
      step: nextStep,
      promoCode: promoCode.trim() || undefined,
      updatedAt: Date.now(),
    });
  }

  useEffect(() => {
    if (!draftRestored) return;
    persistDraft(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    draftRestored,
    businessName,
    category,
    productDescription,
    city,
    planSlug,
    step,
  ]);

  function getStep1Errors(): string[] {
    const errors: string[] = [];
    if (businessName.trim().length < 2) {
      errors.push("Business name must be at least 2 characters.");
    }
    if (!category) errors.push("Please choose a category.");
    if (!city) errors.push("Please choose a town or city.");
    if (isManufacturerCategory(category) && productDescription.trim().length < 3) {
      errors.push(
        "Please describe what you manufacture (at least 3 characters).",
      );
    }
    return errors;
  }

  function getStep2Errors(): string[] {
    const errors: string[] = [];
    if (!isPricingPlanSlug(planSlug)) {
      errors.push("Please select a pricing plan.");
    }
    return errors;
  }

  function goToStep2() {
    const errors = getStep1Errors();
    if (errors.length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors([]);
    setError("");
    persistDraft(2);
    setStep(2);
  }

  function goToStep3() {
    const errors = getStep2Errors();
    if (errors.length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors([]);
    setError("");
    persistDraft(2);

    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setPendingAfterSignup("step3");
        setSignupOpen(true);
        return;
      }
      persistDraft(3);
      setStep(3);
    });
  }

  async function applyPromoCode() {
    setPromoError("");
    setPromoLoading(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        valid?: boolean;
        error?: string;
      };

      if (!res.ok || !data.valid) {
        setIsApplied(false);
        setPromoError(
          data.error || "That code is not valid. Check your FX30 code.",
        );
        return;
      }

      setIsApplied(true);
    } catch {
      setIsApplied(false);
      setPromoError("Could not validate promo code. Please try again.");
    } finally {
      setPromoLoading(false);
    }
  }

  async function launchCampaign() {
    if (launchLockRef.current || loading) return;
    launchLockRef.current = true;

    persistDraft(3);
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      launchLockRef.current = false;
      setPendingAfterSignup("launch");
      setSignupOpen(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payments/iyzico/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          category,
          city,
          planSlug,
          promoApplied: isApplied,
          promoCode: isApplied ? promoCode.trim() : undefined,
          productDescription: isManufacturer
            ? productDescription.trim()
            : undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        paymentPageUrl?: string;
        requiresPayment?: boolean;
        slug?: string;
        paid?: boolean;
        token?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || `Checkout failed (${res.status})`);
      }

      if (data.paymentPageUrl) {
        trackInitiateCheckout({
          value: checkoutCharge.amount,
          currency: checkoutCharge.currency,
          content_name: pricingPlan.name,
          dedupeKey: data.token
            ? `ferixai_meta_initiate_checkout:${data.token}`
            : `ferixai_meta_initiate_checkout:${planSlug}:${checkoutCharge.amount}`,
        });
        window.location.assign(data.paymentPageUrl);
        return;
      }

      if (data.requiresPayment) {
        throw new Error(
          data.error ||
            "iyzico payment page URL was missing. Check API keys and currency settings.",
        );
      }

      // Free / local bypass only
      if (pricing.payable > 0) {
        throw new Error(
          data.error ||
            "Payment is required for this plan, but checkout did not start. Set IYZICO_API_KEY / IYZICO_SECRET_KEY on Vercel and remove FERIXAI_PAYMENT_REQUIRED=false.",
        );
      }

      if (data.slug) {
        router.push(`/dashboard?created=${data.slug}`);
        router.refresh();
        return;
      }

      throw new Error(data.error || "Could not launch campaign");
    } catch (err) {
      launchLockRef.current = false;
      setError(err instanceof Error ? err.message : "Could not launch campaign");
      setLoading(false);
    }
  }

  return (
    <>
      <SignupCard
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        initialBusinessName={businessName}
        redirectTo="/dashboard/new"
        onSuccess={() => {
          setSignupOpen(false);
          if (pendingAfterSignup === "launch") {
            void launchCampaign();
          } else {
            persistDraft(3);
            setStep(3);
          }
          setPendingAfterSignup(null);
        }}
      />

      <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#64748b]">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`rounded-full px-3 py-1 ${
              step === n
                ? "bg-emerald-500/15 text-emerald-200"
                : "bg-white/5 text-[#64748b]"
            }`}
          >
            Step {n}
          </span>
        ))}
      </div>

      {(fieldErrors.length > 0 || error) && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error || fieldErrors.join(" ")}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm text-[#94a3b8]">
              <Building2 className="h-4 w-4" /> Business name
            </label>
            <input
              className="lf-input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Harbour Dental"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm text-[#94a3b8]">
              <Tag className="h-4 w-4" /> Category
            </label>
            <DarkSelect
              value={category}
              onChange={setCategory}
              placeholder="Select a category"
              options={categories.map((c) => ({
                value: c.name,
                label: c.name,
              }))}
            />
          </div>
          {isManufacturer && (
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm text-[#94a3b8]">
                <Package className="h-4 w-4" /> What do you manufacture?
              </label>
              <input
                className="lf-input"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="e.g. precision metal components"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm text-[#94a3b8]">
              <MapPin className="h-4 w-4" /> Town or city
            </label>
            <DarkSelect
              value={city}
              onChange={setCity}
              placeholder="Select a town or city"
              options={UK_CITIES.map((c) => ({
                value: c,
                label: c,
              }))}
            />
          </div>
          <button
            type="button"
            onClick={goToStep2}
            className="lf-btn-primary inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 font-bold text-white"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div>
            <h2 className="lf-orbitron text-xl font-bold text-white sm:text-2xl">
              Choose your plan
            </h2>
            <p className="mt-2 text-sm text-[#94a3b8]">
              Fixed monthly packages for local AI visibility. Growth is our most
              popular starting point.
            </p>
            <div className="mt-5">
              <PricingPlanCards
                selectedSlug={planSlug}
                onSelect={setPlanSlug}
                promoApplied={isApplied}
              />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-[18px] border border-violet-400/30 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-5">
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                  Promo code
                </label>
                <p className="mb-3 text-xs text-[#64748b]">
                  Paste your FX30 code for £30 off the first month of any plan.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (isApplied) setIsApplied(false);
                      if (promoError) setPromoError("");
                    }}
                    placeholder="Enter your FX30 code"
                    disabled={promoLoading}
                    className="lf-input flex-1 border border-violet-400/30 bg-[#0e0a18] px-4 py-3 shadow-[0_0_0_1px_rgba(139,92,246,0.12),0_0_24px_rgba(139,92,246,0.08)]"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => void applyPromoCode()}
                    disabled={promoLoading || !promoCode.trim()}
                    className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/15 px-5 py-3 text-sm font-bold text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/25 disabled:opacity-50"
                  >
                    {promoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {promoError && (
                  <p className="mt-2 text-sm text-red-300" role="alert">
                    {promoError}
                  </p>
                )}
                {isApplied && (
                  <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-[0_0_28px_rgba(16,185,129,0.28)]">
                    £30 off applied — first month{" "}
                    <span className="line-through opacity-70">
                      {formatCurrency(pricing.listPrice)}
                    </span>{" "}
                    {formatCurrency(pricing.payable)}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-[#94a3b8]"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={goToStep3}
                  className="lf-btn-primary inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 font-bold text-white"
                >
                  Review & continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <MetricsPreview planSlug={planSlug} promoApplied={isApplied} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6">
            <h3 className="text-lg font-bold text-white">Review & launch</h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[#64748b]">Business</dt>
                <dd className="text-white">{businessName}</dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Category</dt>
                <dd className="text-white">{category || MANUFACTURER_CATEGORY}</dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Town / city</dt>
                <dd className="text-white">{city}</dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Plan</dt>
                <dd className="text-white">
                  {pricingPlan.name} · {formatCurrency(pricing.listPrice)}
                  /month
                </dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Content pieces</dt>
                <dd className="text-white">{contentPlan.estimatedContentPieces}</dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Intensity</dt>
                <dd className="text-white">{contentPlan.aggressiveness}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6">
            <h3 className="text-lg font-bold text-white">Checkout</h3>
            {checkoutCharge.isTemporaryTryTest ? (
              <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100">
                Temporary test checkout: you will be charged {checkoutLabel}{" "}
                (TRY). Plan list prices remain in GBP.
              </div>
            ) : null}
            {isApplied ? (
              <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-[0_0_28px_rgba(16,185,129,0.28)]">
                £30 promo applied to your first month
              </div>
            ) : null}
            <div className="mt-4 rounded-xl border border-teal-400/25 bg-teal-500/5 px-4 py-3 text-sm text-[#cbd5e1]">
              Secure payment is handled by{" "}
              <span className="font-semibold text-teal-200">iyzico</span>. When
              you launch, you&apos;ll be redirected to the iyzico checkout page
              to pay{" "}
              <span className="font-semibold text-white">{checkoutLabel}</span>
              {checkoutCharge.isTemporaryTryTest
                ? "."
                : isApplied
                  ? " for your first month."
                  : " / month."}
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="text-sm text-[#94a3b8]">Total payable</p>
                {checkoutCharge.isTemporaryTryTest ? (
                  <>
                    <p className="lf-orbitron mt-1 text-3xl font-bold text-emerald-300">
                      {checkoutLabel}
                    </p>
                    <p className="mt-1 text-xs text-[#64748b]">
                      test charge · plan list {formatCurrency(pricing.listPrice)}
                      /month GBP
                    </p>
                  </>
                ) : isApplied ? (
                  <>
                    <p className="mt-1 flex flex-wrap items-baseline gap-2">
                      <span className="text-lg text-[#64748b] line-through">
                        {formatCurrency(pricing.listPrice)}
                      </span>
                      <span className="lf-orbitron text-3xl font-bold text-emerald-300">
                        {formatCurrency(pricing.payable)}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-[#64748b]">
                      first month · then {formatCurrency(pricing.listPrice)}
                      /month
                    </p>
                  </>
                ) : (
                  <>
                    <p className="lf-orbitron mt-1 text-3xl font-bold text-white">
                      {formatCurrency(pricing.payable)}
                    </p>
                    <p className="mt-1 text-xs text-[#64748b]">
                      {pricingPlan.name} · billed monthly
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-[#94a3b8]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={launchCampaign}
              disabled={loading}
              className="lf-btn-primary inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {pricing.payable > 0
                ? `Pay ${checkoutLabel} & launch`
                : "Launch campaign"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
