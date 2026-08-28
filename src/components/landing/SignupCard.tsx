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
import FuturisticScene3DLazy from "@/components/landing/FuturisticScene3DLazy";
import LandingSignupCtaLabel, {
  landingSignupButtonClassName,
} from "@/components/landing/LandingSignupCtaLabel";
import { trackCompleteRegistration, trackLead } from "@/lib/meta/pixel";

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
    window.location.assign(`${path}${separator}business=${businessParam}`);
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
      <div className="lf-animate-in relative w-full max-w-md overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-b from-[#121821] to-[#0a0f16] p-[1px] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="relative overflow-hidden rounded-[19px] bg-[#0b1118]/95 p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <FuturisticScene3DLazy compact />
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
              Quick start
            </p>
            <h2
              id={titleId}
              className="lf-orbitron mt-2 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]"
            >
              Create your account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
              No credit card required to explore. Set up your AI profile in
              seconds.
            </p>

            <div className="mt-3 mb-4 grid grid-cols-1 gap-2 text-[12px] leading-snug text-[#9CA3AF] sm:grid-cols-2 sm:gap-x-3 sm:gap-y-2 sm:text-[13px]">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>⚡</span>
                Instant access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>🔒</span>
                No card required to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>🛡️</span>
                Stripe-style 3D Secure checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>⏱️</span>
                Results begin within 48 hours
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
                  Your Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="Your Business Name"
                  className="lf-input border-white/[0.12] bg-white/[0.04] transition focus:border-fuchsia-400/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18),0_0_24px_rgba(236,72,153,0.16)]"
                  autoComplete="organization"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Your email"
                  className="lf-input border-white/[0.12] bg-white/[0.04] transition focus:border-fuchsia-400/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18),0_0_24px_rgba(236,72,153,0.16)]"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${landingSignupButtonClassName} overflow-hidden transition hover:-translate-y-0.5 disabled:opacity-60`}
              >
                {loading ? (
                  <Loader2 className="relative z-10 h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <LandingSignupCtaLabel />
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[#94a3b8]">
              Already have an account?{" "}
              <Link
                href="/auth?mode=login&redirect=/dashboard/new"
                className="font-semibold text-fuchsia-300 hover:underline"
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
