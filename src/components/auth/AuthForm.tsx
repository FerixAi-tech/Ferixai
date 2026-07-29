"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSafeInternalPath } from "@/lib/auth/safe-redirect";
import BrandLogo from "@/components/layout/BrandLogo";
import { trackCompleteRegistration } from "@/lib/meta/pixel";

export default function AuthForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";
  const redirect = getSafeInternalPath(
    searchParams.get("redirect"),
    "/dashboard",
  );
  const linkError = searchParams.get("error") === "magic_link_failed";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    linkError
      ? "That sign-in link is invalid or has expired. Enter your email to receive a new one."
      : "",
  );
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const title = useMemo(
    () =>
      mode === "login" ? "Sign in to FerixAI" : "Create your FerixAI account",
    [mode],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMagicLinkSent(false);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "login") {
        const emailRedirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            shouldCreateUser: false,
            emailRedirectTo,
          },
        });

        if (otpError) {
          throw new Error(
            otpError.message.includes("Signups not allowed") ||
              otpError.message.toLowerCase().includes("user not found")
              ? "No account found for this email. Please register first."
              : otpError.message,
          );
        }

        setMagicLinkSent(true);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          fullName,
          redirect,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || "Registration failed",
        );
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) throw signInError;

      trackCompleteRegistration();
      window.location.assign(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex justify-center">
        <BrandLogo href="/" size="lg" />
      </div>

      <div className="lf-card-border rounded-[20px] p-[1px]">
        <div className="lf-panel p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">
            Account
          </p>
          <h1 className="lf-orbitron mt-2 text-2xl font-bold text-white">
            {title}
          </h1>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMagicLinkSent(false);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                mode === "login"
                  ? "bg-teal-500/20 text-teal-100"
                  : "text-[#94a3b8]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setMagicLinkSent(false);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                mode === "register"
                  ? "bg-teal-500/20 text-teal-100"
                  : "text-[#94a3b8]"
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {magicLinkSent ? (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <p className="font-semibold text-white">Check your email</p>
                  <p className="mt-1 text-emerald-100/90">
                    We sent a sign-in link to{" "}
                    <span className="font-semibold text-white">
                      {email.trim().toLowerCase()}
                    </span>
                    . Open it to continue — no password needed.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMagicLinkSent(false)}
                    className="mt-3 text-sm font-semibold text-teal-300 hover:underline"
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-sm text-[#94a3b8]">
                    Full name
                  </label>
                  <input
                    className="lf-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm text-[#94a3b8]">
                  Email
                </label>
                <input
                  type="email"
                  className="lf-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.co.uk"
                  autoComplete="email"
                />
              </div>
              {mode === "register" ? (
                <div>
                  <label className="mb-1.5 block text-sm text-[#94a3b8]">
                    Password
                  </label>
                  <input
                    type="password"
                    className="lf-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>
              ) : (
                <p className="text-sm text-[#94a3b8]">
                  Enter the email you registered with. We&apos;ll email you a
                  one-tap sign-in link — no password required.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="lf-btn-primary flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl py-3 font-bold text-white disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "login" ? "Email me a sign-in link" : "Create account"}
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-[#94a3b8]">
            <Link href="/" className="text-teal-300 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
