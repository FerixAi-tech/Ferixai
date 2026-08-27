"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { UAE_CITIES } from "@/lib/constants/cities";
import {
  CUSTOM_CATEGORY_OPTION_VALUE,
  isBusinessCategory,
  isManufacturerCategory,
  isValidCategoryName,
  listBusinessCategoryOptions,
  MANUFACTURER_CATEGORY,
  normalizeCategoryName,
} from "@/lib/constants/categories";
import {
  formatCurrency,
  getCampaignContentPlanForPlan,
} from "@/lib/constants/metrics";
import {
  formatCheckoutCharge,
  getCheckoutCharge,
} from "@/lib/constants/checkout";
import { trackCompleteRegistration, trackInitiateCheckout } from "@/lib/meta/pixel";
import {
  DEFAULT_BILLING_CYCLE,
  DEFAULT_PLAN_SLUG,
  getPlanListPrice,
  getBillingPeriodLabel,
  getPricingPlan,
  isBillingCycle,
  isPricingPlanSlug,
  resolvePricingPlanSlug,
  type BillingCycle,
  type PricingPlanSlug,
} from "@/lib/constants/pricing-plans";
import MetricsPreview from "@/components/campaign/MetricsPreview";
import PricingPlanCards from "@/components/campaign/PricingPlanCards";
import { createClient } from "@/lib/supabase/client";
import {
  emptyKeyFeatures,
  loadCampaignDraft,
  normalizeKeyFeatures,
  saveCampaignDraft,
} from "@/lib/campaign/draft";
import SignupCard from "@/components/landing/SignupCard";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  MapPin,
  Tag,
  Package,
  Sparkles,
} from "lucide-react";
import PaymentMethodLogos from "@/components/payment/PaymentMethodLogos";
import CustomStripeCheckout from "@/components/payment/CustomStripeCheckout";
import { useRouter } from "next/navigation";
import DarkSelect from "@/components/ui/DarkSelect";

type Step = 1 | 2 | 3;

const CATEGORY_OPTIONS = listBusinessCategoryOptions();

function readBrowserCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

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
  const [draftRestored, setDraftRestored] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [pendingAfterSignup, setPendingAfterSignup] = useState<"step3" | null>(
    null,
  );

  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [category, setCategory] = useState("");
  const [customCategoryOpen, setCustomCategoryOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [keyFeatures, setKeyFeatures] =
    useState<[string, string, string]>(() => emptyKeyFeatures());
  const [city, setCity] = useState("");
  const [planSlug, setPlanSlug] =
    useState<PricingPlanSlug>(DEFAULT_PLAN_SLUG);
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>(DEFAULT_BILLING_CYCLE);
  const launchLockRef = useRef(false);
  const checkoutTrackedRef = useRef(false);

  useEffect(() => {
    if (draftRestored) return;
    const draft = loadCampaignDraft();
    if (!draft) {
      setStep(1);
      setCategory("");
      setCustomCategoryOpen(false);
      setCustomCategory("");
      setProductDescription("");
      setKeyFeatures(emptyKeyFeatures());
      setCity("");
      setPlanSlug(DEFAULT_PLAN_SLUG);
      setBillingCycle(DEFAULT_BILLING_CYCLE);
      if (initialBusinessName.trim()) {
        setBusinessName(initialBusinessName.trim());
      } else {
        setBusinessName("");
      }
      setDraftRestored(true);
      return;
    }

    setBusinessName(draft.businessName || initialBusinessName);
    const draftCategory = normalizeCategoryName(draft.category || "");
    if (draftCategory && isBusinessCategory(draftCategory)) {
      setCategory(draftCategory);
      setCustomCategoryOpen(false);
      setCustomCategory("");
    } else if (draftCategory) {
      setCategory(CUSTOM_CATEGORY_OPTION_VALUE);
      setCustomCategoryOpen(true);
      setCustomCategory(draftCategory);
    } else {
      setCategory("");
      setCustomCategoryOpen(false);
      setCustomCategory("");
    }
    setProductDescription(draft.productDescription || "");
    setKeyFeatures(normalizeKeyFeatures(draft.keyFeatures));
    setCity(draft.city);
    setPlanSlug(
      resolvePricingPlanSlug(draft.planSlug) ?? DEFAULT_PLAN_SLUG,
    );
    setBillingCycle(
      isBillingCycle(draft.billingCycle)
        ? draft.billingCycle
        : DEFAULT_BILLING_CYCLE,
    );
    setStep(draft.step || 1);
    setDraftRestored(true);
  }, [draftRestored, initialBusinessName]);

  const pricingPlan = getPricingPlan(planSlug);
  const listPrice = getPlanListPrice(pricingPlan, billingCycle);
  const periodLabel = getBillingPeriodLabel(billingCycle);
  const checkoutCharge = getCheckoutCharge(listPrice);
  const checkoutLabel = formatCheckoutCharge(
    checkoutCharge.amount,
    checkoutCharge.currency,
  );
  const contentPlan = getCampaignContentPlanForPlan(
    pricingPlan,
    listPrice,
  );

  function resolvedCategoryName(): string {
    if (customCategoryOpen || category === CUSTOM_CATEGORY_OPTION_VALUE) {
      return normalizeCategoryName(customCategory);
    }
    return normalizeCategoryName(category);
  }

  const resolvedCategory = resolvedCategoryName();
  const isManufacturer = isManufacturerCategory(resolvedCategory);

  const embeddedCheckoutPayload = useMemo(
    () => ({
      businessName: businessName.trim(),
      category: resolvedCategory,
      city,
      planSlug,
      billingCycle,
      promoApplied: false as const,
      productDescription: isManufacturer ? productDescription.trim() : undefined,
      keyFeatures: keyFeatures.map((f) => f.trim()),
    }),
    [
      businessName,
      resolvedCategory,
      city,
      planSlug,
      billingCycle,
      isManufacturer,
      productDescription,
      keyFeatures,
    ],
  );

  async function persistCategoryToSupabase(name: string): Promise<void> {
    try {
      await fetch("/api/categories/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } catch {
      // Campaign create also ensures the row — ignore network hiccups here.
    }
  }

  function updateKeyFeature(index: 0 | 1 | 2, value: string) {
    setKeyFeatures((prev) => {
      const next: [string, string, string] = [...prev];
      next[index] = value;
      return next;
    });
  }

  function persistDraft(nextStep: Step = step) {
    const name = businessName.trim();
    const cat = resolvedCategoryName();
    if (!name && !cat && !city) return;
    saveCampaignDraft({
      businessName: name,
      category: cat,
      productDescription: isManufacturer ? productDescription.trim() : "",
      keyFeatures,
      city,
      planSlug,
      billingCycle,
      step: nextStep,
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
    customCategory,
    customCategoryOpen,
    productDescription,
    keyFeatures,
    city,
    planSlug,
    billingCycle,
    step,
  ]);

  function getStep1Errors(): string[] {
    const errors: string[] = [];
    const cat = resolvedCategoryName();
    if (businessName.trim().length < 2) {
      errors.push("Business name must be at least 2 characters.");
    }
    if (customCategoryOpen || category === CUSTOM_CATEGORY_OPTION_VALUE) {
      if (!isValidCategoryName(customCategory)) {
        errors.push("Please enter your category (2–80 characters).");
      }
    } else if (!category) {
      errors.push("Please choose a category.");
    }
    if (!city) errors.push("Please choose a city.");
    if (isManufacturerCategory(cat) && productDescription.trim().length < 3) {
      errors.push(
        "Please describe what you manufacture (at least 3 characters).",
      );
    }
    for (const feature of keyFeatures) {
      const trimmed = feature.trim();
      if (trimmed.length === 1) {
        errors.push("Each key feature must be at least 2 characters if filled.");
        break;
      }
      if (trimmed.length > 120) {
        errors.push("Each key feature must be 120 characters or fewer.");
        break;
      }
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

  function trackPlanCheckout(slug: PricingPlanSlug) {
    if (checkoutTrackedRef.current) return;
    checkoutTrackedRef.current = true;
    const plan = getPricingPlan(slug);
    trackInitiateCheckout({
      value: getPlanListPrice(plan, billingCycle),
      currency: "AED",
      content_name: `${plan.name} (${billingCycle})`,
      dedupeKey: `ferixai_meta_initiate_checkout:${slug}:${billingCycle}`,
    });
  }

  function selectPlan(slug: PricingPlanSlug) {
    setPlanSlug(slug);
    trackPlanCheckout(slug);
  }

  async function goToStep2() {
    const errors = getStep1Errors();
    if (errors.length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors([]);
    setError("");
    const cat = resolvedCategoryName();
    await persistCategoryToSupabase(cat);
    persistDraft(2);
    trackCompleteRegistration({
      dedupeKey: "ferixai_meta_complete_registration_step1",
    });
    trackPlanCheckout(planSlug);
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
    trackPlanCheckout(planSlug);

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

  async function launchFreeCampaign() {
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
      setPendingAfterSignup("step3");
      setSignupOpen(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payments/stripe/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          category: resolvedCategory,
          city,
          planSlug,
          billingCycle,
          promoApplied: false,
          productDescription: isManufacturer
            ? productDescription.trim()
            : undefined,
          keyFeatures: keyFeatures.map((f) => f.trim()),
          fbp: readBrowserCookie("_fbp"),
          fbc: readBrowserCookie("_fbc"),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        slug?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || `Launch failed (${res.status})`);
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
          persistDraft(3);
          setStep(3);
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
          <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-100">
            ✓ 100% Automated • Zero technical setup required.
          </p>
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
            {!customCategoryOpen ? (
              <>
                <DarkSelect
                  value={category}
                  onChange={(value) => {
                    setCategory(value);
                    setCustomCategoryOpen(false);
                    setCustomCategory("");
                  }}
                  placeholder="Select a category"
                  options={CATEGORY_OPTIONS.map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomCategoryOpen(true);
                    setCategory(CUSTOM_CATEGORY_OPTION_VALUE);
                    setCustomCategory("");
                  }}
                  className="mt-2 text-left text-sm font-semibold text-teal-300 transition hover:text-teal-200 hover:underline"
                >
                  If your category isn&apos;t listed, click here
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <input
                  className="lf-input"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Type your category"
                  maxLength={80}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomCategoryOpen(false);
                    setCustomCategory("");
                    setCategory("");
                  }}
                  className="text-sm font-semibold text-[#94a3b8] transition hover:text-white hover:underline"
                >
                  Back to category list
                </button>
              </div>
            )}
          </div>
          {resolvedCategory ? (
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm text-[#94a3b8]">
                <Sparkles className="h-4 w-4" /> What are the top 3 features that
                best describe your business?{" "}
                <span className="font-normal text-[#64748b]">(optional)</span>
              </label>
              <p className="mb-3 text-xs text-[#64748b]">
                e.g., 24/7 Emergency Service, Free Inspection, Family Owned
              </p>
              <div className="space-y-3">
                {([0, 1, 2] as const).map((index) => (
                  <input
                    key={index}
                    className="lf-input"
                    value={keyFeatures[index]}
                    onChange={(e) => updateKeyFeature(index, e.target.value)}
                    placeholder={`Key feature ${index + 1}`}
                    maxLength={120}
                  />
                ))}
              </div>
            </div>
          ) : null}
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
              <MapPin className="h-4 w-4" /> City
            </label>
            <DarkSelect
              value={city}
              onChange={setCity}
              placeholder="Select a city"
              options={UAE_CITIES.map((c) => ({
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
              Every plan indexes your business across ChatGPT, Gemini, and
              Claude for local recommendation queries. Growth is pre-selected.
            </p>
            <div className="mt-5">
              <PricingPlanCards
                selectedSlug={planSlug}
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
                onSelect={selectPlan}
              />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
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

            <MetricsPreview planSlug={planSlug} billingCycle={billingCycle} />
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
                <dd className="text-white">
                  {resolvedCategory || MANUFACTURER_CATEGORY}
                </dd>
              </div>
              {keyFeatures.some((f) => f.trim()) ? (
                <div className="sm:col-span-2">
                  <dt className="text-[#64748b]">Key features</dt>
                  <dd className="text-white">
                    {keyFeatures
                      .map((f) => f.trim())
                      .filter(Boolean)
                      .join(" · ")}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[#64748b]">City</dt>
                <dd className="text-white">{city}</dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Plan</dt>
                <dd className="text-white">
                  {pricingPlan.name} · {formatCurrency(listPrice)}
                  /{periodLabel}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Intensity</dt>
                <dd className="text-white">{contentPlan.aggressiveness}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6">
            <h3 className="text-lg font-bold text-white">Checkout</h3>
            <div className="mt-4 rounded-xl border border-teal-400/25 bg-teal-500/5 px-4 py-3 text-sm text-[#cbd5e1]">
              Enter your payment details below to launch your campaign. Amount
              due:{" "}
              <span className="font-semibold text-white">{checkoutLabel}</span> /
              {periodLabel}.
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="text-sm text-[#94a3b8]">Total payable</p>
                <p className="lf-orbitron mt-1 text-3xl font-bold text-white">
                  {formatCurrency(listPrice)}
                </p>
                <p className="mt-1 text-xs text-[#64748b]">
                  {pricingPlan.name} · billed {billingCycle}
                </p>
              </div>
            </div>

            {listPrice > 0 ? (
              <CustomStripeCheckout
                payload={embeddedCheckoutPayload}
                payLabel={`Pay ${checkoutLabel} & launch`}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <PaymentMethodLogos />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-[#94a3b8]"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {listPrice === 0 ? (
                <button
                  type="button"
                  onClick={launchFreeCampaign}
                  disabled={loading}
                  className="lf-btn-primary inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Launch campaign
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
