"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import type { AiPreviewPayload } from "@/lib/preview/build-answer";
import {
  loadLeadMagnetInput,
  saveLeadMagnetInput,
} from "@/lib/lead-magnet";
import {
  emptyKeyFeatures,
  loadCampaignDraft,
  normalizeKeyFeatures,
  saveCampaignDraft,
} from "@/lib/campaign/draft";
import { DEFAULT_PLAN_SLUG } from "@/lib/constants/pricing-plans";
import { LAUNCH_PROMO_CODE } from "@/lib/promo/codes";

function TypewriterMarkdown({
  text,
  active,
}: {
  text: string;
  active: boolean;
}) {
  const [visible, setVisible] = useState(active ? 0 : text.length);

  useEffect(() => {
    if (!active) {
      setVisible(text.length);
      return;
    }
    setVisible(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setVisible(i);
      if (i >= text.length) window.clearInterval(id);
    }, 12);
    return () => window.clearInterval(id);
  }, [text, active]);

  const slice = text.slice(0, visible);
  const parts = slice.split(/(\*\*[^*]+\*\*)/g);

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#e2e8f0] sm:text-[15px]">
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
      {active && visible < text.length ? (
        <span
          className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-emerald-300 align-middle"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

/**
 * Dashboard top card: live ChatGPT preview from saved lead-magnet inputs.
 */
export default function DashboardAiPreviewCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<AiPreviewPayload | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [features, setFeatures] =
    useState<[string, string, string]>(emptyKeyFeatures);
  const [showFeatures, setShowFeatures] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchPreview(opts: {
    businessName: string;
    category: string;
    city: string;
    feature1?: string;
    feature2?: string;
    feature3?: string;
  }) {
    const res = await fetch("/api/preview-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      preview?: AiPreviewPayload;
    };
    if (!res.ok || !data.preview) {
      throw new Error(data.error || "Could not load AI preview.");
    }
    return data.preview;
  }

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const lead = loadLeadMagnetInput();
      const draft = loadCampaignDraft();
      const name = lead?.businessName || draft?.businessName || "";
      const cat = lead?.category || draft?.category || "";
      const town = lead?.city || draft?.city || "";
      const feats = normalizeKeyFeatures(draft?.keyFeatures);

      if (!name || !cat || !town) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      setBusinessName(name);
      setCategory(cat);
      setCity(town);
      setFeatures(feats);

      try {
        const result = await fetchPreview({
          businessName: name,
          category: cat,
          city: town,
          feature1: feats[0] || undefined,
          feature2: feats[1] || undefined,
          feature3: feats[2] || undefined,
        });
        if (!cancelled) setPreview(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load AI preview.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  async function applyFeatures() {
    if (!businessName || !category || !city) return;
    setRefreshing(true);
    setError("");
    try {
      saveLeadMagnetInput({ businessName, category, city });
      saveCampaignDraft({
        businessName,
        category,
        productDescription: "",
        keyFeatures: features,
        city,
        planSlug: loadCampaignDraft()?.planSlug || DEFAULT_PLAN_SLUG,
        step: 1,
        promoCode: LAUNCH_PROMO_CODE,
        updatedAt: Date.now(),
      });
      const result = await fetchPreview({
        businessName,
        category,
        city,
        feature1: features[0] || undefined,
        feature2: features[1] || undefined,
        feature3: features[2] || undefined,
      });
      setPreview(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not refresh preview.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="mb-8 flex min-h-[160px] items-center justify-center rounded-[20px] border border-violet-500/20 bg-[#0B0F17]/80 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
        <span className="ml-3 text-sm text-[#94a3b8]">
          Loading your AI search report…
        </span>
      </div>
    );
  }

  if (!preview && !error) {
    return null;
  }

  return (
    <section className="mb-10 space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            Live AI preview &amp; audit
          </p>
          <h2 className="lf-orbitron mt-1 text-xl font-bold text-white sm:text-2xl">
            Your ChatGPT recommendation draft
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowFeatures((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200 hover:underline"
        >
          <Sparkles className="h-4 w-4" />
          {showFeatures ? "Hide custom features" : "Add optional USPs"}
        </button>
      </div>

      {showFeatures ? (
        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-xs text-[#94a3b8]">
            Optional — refine highlights used in your AI preview.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {([0, 1, 2] as const).map((index) => (
              <input
                key={index}
                className="lf-input"
                value={features[index]}
                onChange={(e) => {
                  const next = [...features] as [string, string, string];
                  next[index] = e.target.value;
                  setFeatures(next);
                }}
                placeholder={`Feature ${index + 1}`}
                maxLength={120}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => void applyFeatures()}
            disabled={refreshing}
            className="mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/15 px-4 py-2 text-sm font-bold text-violet-100 disabled:opacity-50"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Refresh preview
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {preview ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F17] shadow-[0_0_32px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <Image
              src="/chatgpt.png"
              alt="ChatGPT"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                ChatGPT Search Simulation
              </p>
              <p className="text-[11px] text-[#94a3b8]">
                Model: GPT-4o · {preview.fromGoogle ? "Google verified" : "Draft fallback"}
              </p>
            </div>
          </div>
          <div className="space-y-4 px-4 py-4">
            <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2.5 text-sm text-[#e9d5ff]">
              {preview.question}
            </div>
            <TypewriterMarkdown text={preview.answerMarkdown} active />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
          🟢 Status: DRAFT PROFILE (Not Published)
        </p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
          Publish your profile live to ChatGPT, Gemini &amp; Claude networks.
        </p>
        <Link
          href="/dashboard/new"
          className="lf-btn-primary mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white sm:w-auto"
        >
          <span aria-hidden>🚀</span>
          <span>Launch Live for £9 (Use Code: FX30)</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
