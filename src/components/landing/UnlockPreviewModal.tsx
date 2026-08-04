"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  clearWizardSessionState,
  emptyKeyFeatures,
  saveCampaignDraft,
} from "@/lib/campaign/draft";
import { DEFAULT_PLAN_SLUG } from "@/lib/constants/pricing-plans";
import { LAUNCH_PROMO_CODE } from "@/lib/promo/codes";
import {
  loadLeadMagnetInput,
  saveLeadMagnetInput,
  type LeadMagnetInput,
} from "@/lib/lead-magnet";
import { trackCompleteRegistration, trackLead } from "@/lib/meta/pixel";
import FuturisticScene3D from "@/components/landing/FuturisticScene3D";

/**
 * Forced registration gate after lead-magnet scan.
 * Email + password → unlock dashboard AI preview.
 */
export default function UnlockPreviewModal({
  open,
  onClose,
  lead,
}: {
  open: boolean;
  onClose: () => void;
  lead: LeadMagnetInput | null;
}) {
  const titleId = useId();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setPassword("");
    setError("");
    trackLead({ content_name: "Unlock Preview Modal" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  const businessName =
    lead?.businessName?.trim() ||
    loadLeadMagnetInput()?.businessName ||
    "Your business";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;
    const currentLead = lead || loadLeadMagnetInput();

    if (!currentLead) {
      setError("Please enter your business details first.");
      setLoading(false);
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
          fullName: currentLead.businessName,
          redirect: "/dashboard",
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };

      if (!res.ok) {
        // Existing users: try sign-in with the password they entered.
        if (res.status === 409) {
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email: trimmedEmail,
              password: trimmedPassword,
            },
          );
          if (signInError) {
            throw new Error(
              "This email is already registered. Sign in with your password, or use a different email.",
            );
          }
        } else {
          throw new Error(data.error || "Could not create account");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        if (signInError) {
          throw new Error(
            signInError.message ||
              "Account created, but we could not open your session. Please sign in.",
          );
        }
      }

      // Preserve lead inputs after wipe.
      clearWizardSessionState();
      saveLeadMagnetInput(currentLead);
      saveCampaignDraft({
        businessName: currentLead.businessName,
        category: currentLead.category,
        productDescription: "",
        keyFeatures: emptyKeyFeatures(),
        city: currentLead.city,
        planSlug: DEFAULT_PLAN_SLUG,
        step: 1,
        promoCode: LAUNCH_PROMO_CODE,
        updatedAt: Date.now(),
      });

      trackCompleteRegistration();
      window.location.assign("/dashboard?preview=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Report ready
            </p>
            <h2
              id={titleId}
              className="lf-orbitron mt-2 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]"
            >
              🔒 Your AI Business Report is Ready!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
              Create your free account to unlock your live ChatGPT preview for{" "}
              <strong className="text-white">{businessName}</strong> and claim
              your £30 UK launch credit.
            </p>

            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Your Email"
                  className="lf-input border-white/[0.12] bg-white/[0.04]"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Create a password"
                  className="lf-input border-white/[0.12] bg-white/[0.04]"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              {error ? (
                <p className="text-sm text-red-300" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="lf-btn-primary flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>Unlock My Preview &amp; Go to Dashboard</span>
                <span aria-hidden>→</span>
              </button>
            </form>

            <p className="mt-4 text-center text-[11px] text-[#64748b]">
              Already have an account?{" "}
              <Link
                href="/auth?mode=login&redirect=/dashboard"
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
