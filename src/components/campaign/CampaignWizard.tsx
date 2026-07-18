"use client";

import { useState, useEffect } from "react";
import { UK_CITIES } from "@/lib/constants/cities";
import {
  isManufacturerCategory,
  MANUFACTURER_CATEGORY,
  sortCategories,
} from "@/lib/constants/categories";
import {
  BUDGET_MIN,
  DAYS_MIN,
  formatCurrency,
  getCampaignContentPlan,
} from "@/lib/constants/metrics";
import MetricsPreview, {
  BudgetSlider,
  DaysSlider,
} from "@/components/campaign/MetricsPreview";
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
  const [dailyBudget, setDailyBudget] = useState(BUDGET_MIN);
  const [days, setDays] = useState(DAYS_MIN);
  const [promoCode, setPromoCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

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
      setDailyBudget(BUDGET_MIN);
      setDays(DAYS_MIN);
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
    setDailyBudget(draft.dailyBudget || BUDGET_MIN);
    setDays(draft.days || DAYS_MIN);
    setStep(draft.step || 1);
    setPromoCode(draft.promoCode || "");
    setIsApplied(false);
    setDraftRestored(true);
  }, [draftRestored, initialBusinessName]);

  const plan = getCampaignContentPlan(dailyBudget, days);
  const isManufacturer = isManufacturerCategory(category);

  function persistDraft(nextStep: Step = step) {
    const name = businessName.trim();
    if (!name && !category && !city) return;
    saveCampaignDraft({
      businessName: name,
      category,
      productDescription: isManufacturer ? productDescription.trim() : "",
      city,
      dailyBudget,
      days,
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
    dailyBudget,
    days,
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
    if (dailyBudget < BUDGET_MIN) {
      errors.push(`Daily plan must be at least ${formatCurrency(BUDGET_MIN)}.`);
    }
    if (days < DAYS_MIN) {
      errors.push(`Campaign length must be at least ${DAYS_MIN} days.`);
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
        dailyBudgetGbp?: number;
        campaignDays?: number;
      };

      if (!res.ok || !data.valid) {
        setIsApplied(false);
        setPromoError(
          data.error || "That code is not valid. Check your email for FX30.",
        );
        return;
      }

      setIsApplied(true);
      if (typeof data.dailyBudgetGbp === "number") {
        setDailyBudget(data.dailyBudgetGbp);
      }
      if (typeof data.campaignDays === "number") {
        setDays(data.campaignDays);
      }
      setCardName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
    } catch {
      setIsApplied(false);
      setPromoError("Could not validate promo code. Please try again.");
    } finally {
      setPromoLoading(false);
    }
  }

  async function launchCampaign() {
    persistDraft(3);
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPendingAfterSignup("launch");
      setSignupOpen(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          category,
          city,
          dailyBudget,
          days,
          productDescription: isManufacturer
            ? productDescription.trim()
            : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || "Could not launch campaign",
        );
      }

      const slug = (data as { slug?: string }).slug;
      router.push(slug ? `/dashboard?created=${slug}` : "/dashboard");
      router.refresh();
    } catch (err) {
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
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <BudgetSlider
              value={dailyBudget}
              onChange={(v) => {
                if (isApplied) return;
                setDailyBudget(v);
              }}
            />
            <DaysSlider
              value={days}
              onChange={(v) => {
                if (isApplied) return;
                setDays(v);
              }}
            />

            <div className="rounded-[18px] border border-violet-400/30 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-5">
              <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                Promo code
              </label>
              <p className="mb-3 text-xs text-[#64748b]">
                Paste the FX30 code from registration to unlock a 3-day free
                campaign.
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
                  ✨ Promo Code Applied: 3-Day Free Campaign Activated (£30
                  Value)
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
          <MetricsPreview
            dailyBudget={dailyBudget}
            days={days}
            promoApplied={isApplied}
          />
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
                  {formatCurrency(dailyBudget)} / day · {days} days
                </dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Content pieces</dt>
                <dd className="text-white">{plan.estimatedContentPieces}</dd>
              </div>
              <div>
                <dt className="text-[#64748b]">Intensity</dt>
                <dd className="text-white">{plan.aggressiveness}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6">
            <h3 className="text-lg font-bold text-white">Checkout</h3>
            {isApplied ? (
              <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 shadow-[0_0_28px_rgba(16,185,129,0.28)]">
                ✨ Promo Code Applied: 3-Day Free Campaign Activated (£30 Value)
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-[#94a3b8]">
                  No promo applied. Go back to Step 2 to enter your FX30 code,
                  or continue with card details (coming soon).
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">
                  Card details
                </p>
                <div>
                  <label className="mb-1.5 block text-sm text-[#94a3b8]">
                    Name on card
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Jane Smith"
                    className="lf-input"
                    autoComplete="cc-name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#94a3b8]">
                    Card number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="•••• •••• •••• ••••"
                    className="lf-input"
                    autoComplete="cc-number"
                    inputMode="numeric"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm text-[#94a3b8]">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="lf-input"
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-[#94a3b8]">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="lf-input"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="text-sm text-[#94a3b8]">Total payable</p>
                <p
                  className={`lf-orbitron mt-1 text-3xl font-bold ${
                    isApplied ? "text-emerald-300" : "text-white"
                  }`}
                >
                  {isApplied ? "£0" : formatCurrency(plan.totalCost)}
                </p>
                <p className="mt-1 text-xs text-[#64748b]">
                  {formatCurrency(dailyBudget)} × {days} days
                </p>
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
              {isApplied
                ? "Launch 3-Day Free Campaign"
                : "Launch free campaign"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
