"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PLAN_SLUG } from "@/lib/constants/pricing-plans";
import {
  clearWizardSessionState,
  saveCampaignDraft,
} from "@/lib/campaign/draft";
import { appendMarketingParams } from "@/lib/analytics/marketing-attribution";
import {
  trackGoogleAdsSignup,
  withGoogleAdsSignupQuery,
} from "@/lib/google-ads/conversion";
import { trackCompleteRegistration, trackLead } from "@/lib/meta/pixel";

const TRUST_ITEMS = [
  { icon: "⚡", label: "Instant access" },
  { icon: "❌", label: "No credit card" },
  { icon: "🔒", label: "Secure checkout" },
  { icon: "⏱️", label: "Results begin within 48h" },
] as const;

const AI_PLATFORMS = ["ChatGPT", "Gemini", "Claude", "Perplexity"] as const;

const ONBOARDING_STEPS = [
  { step: "01", label: "Create account" },
  { step: "02", label: "Add your business" },
  { step: "03", label: "Track AI visibility" },
] as const;

interface SignupCardProps {
  open: boolean;
  onClose: () => void;
  initialBusinessName?: string;
  onSuccess?: (payload: { businessName: string; email: string }) => void;
  redirectTo?: string;
}

export default function SignupCard({
  open,
  onClose,
  initialBusinessName = "",
  onSuccess,
  redirectTo = "/dashboard/new",
}: SignupCardProps) {
  const titleId = useId();
  const supabase = createClient();
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signInHref, setSignInHref] = useState(
    "/auth?mode=login&redirect=/dashboard/new",
  );

  useEffect(() => {
    setSignInHref(
      appendMarketingParams("/auth?mode=login&redirect=/dashboard/new"),
    );
  }, []);

  useEffect(() => {
    if (open) {
      setBusinessName(initialBusinessName);
      setError("");
      trackLead({ content_name: "Signup Modal" });
    }
  }, [open, initialBusinessName]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  function finishSuccess(
    trimmedName: string,
    trimmedEmail: string,
    path: string,
  ) {
    if (onSuccess) {
      onSuccess({ businessName: trimmedName, email: trimmedEmail });
      onClose();
      return;
    }

    const businessParam = encodeURIComponent(trimmedName);
    const separator = path.includes("?") ? "&" : "?";
    window.location.assign(
      appendMarketingParams(
        withGoogleAdsSignupQuery(
          `${path}${separator}business=${businessParam}`,
        ),
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedName = businessName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/quick-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: trimmedName,
          email: trimmedEmail,
          redirect: redirectTo,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || "Could not create account",
        );
      }

      const signInEmail = (data as { email?: string }).email;
      const password = (data as { password?: string }).password;
      const nextPath =
        (data as { redirectTo?: string }).redirectTo || redirectTo;

      if (!signInEmail || !password) {
        throw new Error("Account created, but sign-in failed. Please sign in.");
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: signInEmail,
          password,
        });

      if (signInError || !signInData.session) {
        throw new Error(
          signInError?.message ||
            "Account created, but we could not open your session. Please sign in.",
        );
      }

      clearWizardSessionState();
      saveCampaignDraft({
        businessName: trimmedName,
        category: "",
        productDescription: "",
        keyFeatures: ["", "", ""],
        city: "",
        planSlug: DEFAULT_PLAN_SLUG,
        step: 1,
        updatedAt: Date.now(),
      });

      trackCompleteRegistration();
      await trackGoogleAdsSignup({
        userId: signInData.session.user.id,
        email: signInEmail,
      });
      finishSuccess(trimmedName, trimmedEmail, nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="lf-animate-in relative w-full max-w-lg overflow-hidden rounded-[20px] border border-violet-500/20 bg-gradient-to-b from-[#141024] to-[#0a0712] p-[1px] shadow-[0_24px_80px_rgba(88,28,135,0.35)]">
        <div className="relative overflow-hidden rounded-[19px] bg-[#0b0d14]/98 p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-[#64748b] transition hover:bg-white/5 hover:text-white disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-violet-300">
              ✦ AI Visibility Platform
            </p>
            <h2
              id={titleId}
              className="lf-orbitron mt-3 text-center text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]"
            >
              Create your account
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-[#94a3b8]">
              Make your business more visible across the AI search ecosystem.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-[#9ca3af] sm:text-[13px]">
              {TRUST_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5"
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-500/35 bg-red-500/10 p-3 text-sm text-red-200"
              >
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="Your Business Name"
                  className="lf-input border-white/[0.12] bg-white/[0.04] transition focus:border-violet-400/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]"
                  autoComplete="organization"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Your email"
                  className="lf-input border-white/[0.12] bg-white/[0.04] transition focus:border-violet-400/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="lf-btn-primary inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span aria-hidden>🚀</span>
                    Sign Up For Free
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
                AI Visibility Across
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {AI_PLATFORMS.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-100"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            <ol className="mt-6 space-y-2 border-t border-white/10 pt-6">
              {ONBOARDING_STEPS.map((item) => (
                <li
                  key={item.step}
                  className="flex items-center gap-3 text-sm text-[#cbd5e1]"
                >
                  <span className="lf-orbitron text-xs font-bold text-violet-300">
                    {item.step}
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ol>

            <p className="mt-6 text-center text-sm text-[#94a3b8]">
              🇦🇪 Built for UAE businesses
            </p>

            <p className="mt-3 text-center text-sm text-[#94a3b8]">
              Already have an account?{" "}
              <Link
                href={signInHref}
                className="font-semibold text-violet-300 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
