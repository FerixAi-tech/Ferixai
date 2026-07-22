"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PLAN_SLUG } from "@/lib/constants/pricing-plans";
import {
  clearWizardSessionState,
  generateUniquePromoCode,
  saveCampaignDraft,
} from "@/lib/campaign/draft";
import FuturisticScene3D from "@/components/landing/FuturisticScene3D";
import { trackCompleteRegistration } from "@/lib/meta/pixel";

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [continuePath, setContinuePath] = useState(redirectTo);
  const [promoCodeValue, setPromoCodeValue] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setBusinessName(initialBusinessName);
      setError("");
      setIsSubmitted(false);
      setSubmittedEmail("");
      setContinuePath(redirectTo);
      setCopied(false);
      setPromoCodeValue("");
    }
  }, [open, initialBusinessName, redirectTo]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  function finishSuccess(trimmedName: string, trimmedEmail: string) {
    if (onSuccess) {
      onSuccess({ businessName: trimmedName, email: trimmedEmail });
      onClose();
      return;
    }

    const businessParam = encodeURIComponent(trimmedName);
    const separator = continuePath.includes("?") ? "&" : "?";
    window.location.assign(
      `${continuePath}${separator}business=${businessParam}`,
    );
  }

  async function copyPromoCode() {
    if (!promoCodeValue) return;
    try {
      await navigator.clipboard.writeText(promoCodeValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / denied clipboard
      const textarea = document.createElement("textarea");
      textarea.value = promoCodeValue;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
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

      // New account: wipe previous browser wizard/session state, then start at Step 1
      clearWizardSessionState();
      const uniquePromoCode = generateUniquePromoCode();
      saveCampaignDraft({
        businessName: trimmedName,
        category: "",
        productDescription: "",
        city: "",
        planSlug: DEFAULT_PLAN_SLUG,
        step: 1,
        promoCode: uniquePromoCode,
        updatedAt: Date.now(),
      });

      setContinuePath(nextPath);
      setSubmittedEmail(trimmedEmail);
      setPromoCodeValue(uniquePromoCode);
      setCopied(false);
      setIsSubmitted(true);
      trackCompleteRegistration();
      setLoading(false);
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
      <div className="lf-animate-in relative w-full max-w-md overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-b from-[#121821] to-[#0a0f16] p-[1px] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="relative overflow-hidden rounded-[19px] bg-[#0b1118]/95 p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <FuturisticScene3D compact />
          </div>

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
            {isSubmitted ? (
              <div className="lf-animate-in">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Welcome aboard
                </p>
                <h2
                  id={titleId}
                  className="lf-orbitron mt-2 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]"
                >
                  ✨ Account Created Successfully!
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
                  Your £30 welcome credit is ready. Copy the exclusive promo
                  code below and apply it on the plan selection page for £30 off
                  your first month.
                </p>

                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-violet-400/35 bg-[linear-gradient(135deg,rgba(139,92,246,0.16),rgba(236,72,153,0.1),rgba(18,12,30,0.95))] p-3 shadow-[0_0_32px_rgba(139,92,246,0.22)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                  <code className="lf-orbitron truncate px-2 text-center font-mono text-2xl font-extrabold tracking-[0.14em] text-[#f5d0fe] [text-shadow:0_0_18px_rgba(240,171,252,0.55),0_0_36px_rgba(168,85,247,0.35)] sm:text-left sm:text-3xl">
                    {promoCodeValue}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyPromoCode()}
                    className="lf-btn-primary inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold tracking-wide text-white"
                  >
                    {copied ? "✅ Copied!" : "📋 Copy Code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    finishSuccess(businessName.trim(), submittedEmail)
                  }
                  className="mt-6 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-fuchsia-400/35 bg-fuchsia-500/10 px-4 py-3.5 text-sm font-bold tracking-wide text-fuchsia-100 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20 sm:text-base"
                >
                  <span>Go to Plan Selection</span>
                  <span aria-hidden className="tracking-normal">
                    →
                  </span>
                </button>

                <p className="mt-4 text-center text-[11px] leading-relaxed tracking-wide text-[#64748b]">
                  Keep this code handy — apply it on plan selection for £30 off
                  your first month.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
                  Quick start
                </p>
                <h2
                  id={titleId}
                  className="lf-orbitron mt-2 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]"
                >
                  Claim your £30 welcome code
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
                  No credit card required to explore. Set up your AI profile in
                  seconds.
                </p>

                <div className="mt-3 mb-4 flex justify-between gap-1.5 text-[12px] leading-snug text-[#9CA3AF] sm:gap-2 sm:text-[13px]">
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden>⚡</span>
                    Instant Access
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden>🎁</span>
                    £30 Free Budget Inside
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden>🔒</span>
                    No Card Required to Start
                  </span>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-500/35 bg-red-500/10 p-3 text-sm text-red-200"
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                      Business name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="e.g. Harbour Dental, Bristol"
                      className="lf-input border-white/[0.12] bg-white/[0.04] transition focus:border-fuchsia-400/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18),0_0_24px_rgba(236,72,153,0.16)]"
                      autoComplete="organization"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                      Work email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@company.co.uk"
                      className="lf-input border-white/[0.12] bg-white/[0.04] transition focus:border-fuchsia-400/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18),0_0_24px_rgba(236,72,153,0.16)]"
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="lf-btn-primary relative flex w-full min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide text-white transition hover:-translate-y-0.5 disabled:opacity-60 sm:text-base"
                  >
                    {loading && (
                      <Loader2 className="relative z-10 h-4 w-4 shrink-0 animate-spin" />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-2">
                      <span aria-hidden className="text-[1.05em] leading-none">
                        🚀
                      </span>
                      <span>Claim My £30 Code & Start Free</span>
                      <span aria-hidden className="tracking-normal">
                        →
                      </span>
                    </span>
                  </button>
                </form>

                <p className="mt-4 text-center text-[11px] leading-relaxed tracking-wide text-[#64748b]">
                  One-time promo code valid for new verified business names only
                  to prevent abuse. No credit card required to explore.
                </p>

                <p className="mt-5 text-center text-sm text-[#94a3b8]">
                  Already have an account?{" "}
                  <Link
                    href="/auth?mode=login&redirect=/dashboard/new"
                    className="font-semibold text-fuchsia-300 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
