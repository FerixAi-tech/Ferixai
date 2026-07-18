"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPanelLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin-panel/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error || "Login failed");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="lf-card-surface w-full space-y-4 p-8"
      >
        <h1 className="lf-orbitron text-2xl font-bold text-white">
          FerixAI Admin
        </h1>
        <p className="text-sm text-[#94a3b8]">
          Enter the administrator password to continue.
        </p>
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <input
          type="password"
          className="lf-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Administrator password"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="lf-btn-primary flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl font-bold text-white disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </div>
  );
}
