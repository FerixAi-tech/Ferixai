"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Sparkles } from "lucide-react";
import DarkSelect from "@/components/ui/DarkSelect";
import { UK_CITIES } from "@/lib/constants/cities";
import { listBusinessCategoryOptions } from "@/lib/constants/categories";
import type { AiPreviewPayload } from "@/lib/preview/build-answer";

const SCAN_LINES = [
  "[1/3] Searching Google Business Registry...",
  "[2/3] Extracting address & ratings...",
  "[3/3] Structuring data for ChatGPT, Gemini & Claude...",
] as const;

type PreviewStep = "input" | "scanning" | "preview";

type AiPreviewResponse = {
  ok?: boolean;
  error?: string;
  preview?: AiPreviewPayload;
};

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

export default function BusinessPreviewSection({
  onClaim,
}: {
  onClaim?: () => void;
}) {
  const categoryOptions = useMemo(() => listBusinessCategoryOptions(), []);

  const [step, setStep] = useState<PreviewStep>("input");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [feature1, setFeature1] = useState("");
  const [feature2, setFeature2] = useState("");
  const [feature3, setFeature3] = useState("");
  const [error, setError] = useState("");
  const [scanLine, setScanLine] = useState(0);
  const [preview, setPreview] = useState<AiPreviewPayload | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (step !== "scanning") return;
    setScanLine(0);
    const timers = [
      window.setTimeout(() => setScanLine(1), 800),
      window.setTimeout(() => setScanLine(2), 1600),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [step]);

  async function generatePreview() {
    setError("");
    if (businessName.trim().length < 2) {
      setError("Please enter your business name.");
      return;
    }
    if (!city) {
      setError("Please select a town or city.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }

    setIsScanning(true);
    setStep("scanning");
    setPreview(null);

    const started = Date.now();

    try {
      const res = await fetch("/api/preview-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city,
          category,
          feature1: feature1.trim() || undefined,
          feature2: feature2.trim() || undefined,
          feature3: feature3.trim() || undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as AiPreviewResponse;
      if (!res.ok || !data.preview) {
        throw new Error(data.error || "Could not generate preview.");
      }

      // Keep the scan animation visible for ~2.4s even if Places is fast.
      const elapsed = Date.now() - started;
      if (elapsed < 2400) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, 2400 - elapsed),
        );
      }

      setPreview(data.preview);
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate preview.",
      );
      setStep("input");
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <section id="ai-preview" className="pb-16 pt-4">
      <div className="lf-animate-in mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Live AI audit
        </p>
        <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
          See how ChatGPT would recommend your business
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#94a3b8]">
          Enter your details for a live Google Business scan and a realistic
          ChatGPT recommendation preview — before you publish.
        </p>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-violet-500/25 bg-[linear-gradient(165deg,rgba(18,12,30,0.96),rgba(11,15,23,0.98))] shadow-[0_0_48px_rgba(139,92,246,0.12)]">
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Input panel */}
          <div className="border-b border-white/5 p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Business details
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-[#94a3b8]">
                  Business name
                </label>
                <input
                  className="lf-input"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Harbour Dental"
                  maxLength={120}
                  disabled={isScanning}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-[#94a3b8]">
                  Town or city
                </label>
                <DarkSelect
                  value={city}
                  onChange={setCity}
                  placeholder="Select a town or city"
                  options={UK_CITIES.map((c) => ({ value: c, label: c }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-[#94a3b8]">
                  Category
                </label>
                <DarkSelect
                  value={category}
                  onChange={setCategory}
                  placeholder="Select a category"
                  options={categoryOptions.map((c) => ({
                    value: c.name,
                    label: c.name,
                  }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-[#94a3b8]">
                  Top features{" "}
                  <span className="font-normal text-[#64748b]">(optional)</span>
                </label>
                <div className="space-y-2">
                  <input
                    className="lf-input"
                    value={feature1}
                    onChange={(e) => setFeature1(e.target.value)}
                    placeholder="Key feature 1"
                    maxLength={120}
                    disabled={isScanning}
                  />
                  <input
                    className="lf-input"
                    value={feature2}
                    onChange={(e) => setFeature2(e.target.value)}
                    placeholder="Key feature 2"
                    maxLength={120}
                    disabled={isScanning}
                  />
                  <input
                    className="lf-input"
                    value={feature3}
                    onChange={(e) => setFeature3(e.target.value)}
                    placeholder="Key feature 3"
                    maxLength={120}
                    disabled={isScanning}
                  />
                </div>
              </div>

              {error ? (
                <p className="text-sm text-red-300" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => void generatePreview()}
                disabled={isScanning}
                className="lf-btn-primary inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-60"
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span aria-hidden>🚀</span>
                )}
                <span>
                  {isScanning ? "Scanning live…" : "Generate My AI Preview"}
                </span>
              </button>
            </div>
          </div>

          {/* Preview panel */}
          <div className="bg-[#0B0F17]/90 p-5 sm:p-7">
            {step === "input" && !preview ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
                <p className="text-sm font-medium text-[#94a3b8]">
                  Your ChatGPT recommendation preview will appear here after a
                  live business scan.
                </p>
              </div>
            ) : null}

            {step === "scanning" ? (
              <div className="flex min-h-[320px] flex-col justify-center rounded-2xl border border-emerald-500/20 bg-black/40 p-5 font-mono text-sm text-emerald-200/95 shadow-[inset_0_0_40px_rgba(16,185,129,0.08)]">
                <p className="mb-4 text-xs uppercase tracking-[0.18em] text-emerald-400/80">
                  Live scan terminal
                </p>
                {SCAN_LINES.map((line, index) => (
                  <p
                    key={line}
                    className={`mb-2 transition ${
                      index <= scanLine
                        ? "opacity-100"
                        : "opacity-25"
                    }`}
                  >
                    {index < scanLine ? "✓ " : index === scanLine ? "› " : "  "}
                    {line}
                  </p>
                ))}
                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-violet-400" />
                </div>
              </div>
            ) : null}

            {step === "preview" && preview ? (
              <div className="space-y-4">
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
                        Model: GPT-4o
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 px-4 py-4">
                    <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2.5 text-sm text-[#e9d5ff]">
                      {preview.question}
                    </div>
                    <TypewriterMarkdown
                      text={preview.answerMarkdown}
                      active
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                    🟢 Status: PREVIEW MODE (DRAFT)
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
                    Publish your business data live across ChatGPT, Gemini &amp;
                    Claude today.
                  </p>
                  <button
                    type="button"
                    onClick={onClaim}
                    className="lf-btn-primary mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white sm:w-auto"
                  >
                    <span aria-hidden>🚀</span>
                    <span>Claim £30 Credit &amp; Launch Live for £9</span>
                    <span aria-hidden>→</span>
                  </button>
                  <p className="mt-2 text-xs text-emerald-100/70">
                    No credit card required to start • Setup in 30 seconds
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep("input");
                    setPreview(null);
                  }}
                  className="text-sm font-semibold text-[#94a3b8] transition hover:text-white hover:underline"
                >
                  Run another preview
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
