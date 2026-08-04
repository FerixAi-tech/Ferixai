"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { AiPreviewPayload } from "@/lib/preview/build-answer";

const SCAN_LINES = [
  "[1/3] Searching Google Business Registry...",
  "[2/3] Fetching address & ratings...",
  "[3/3] Structuring data for ChatGPT, Gemini & Claude...",
] as const;

type PreviewPhase = "idle" | "scanning" | "ready";

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
 * Onboarding Step 1 AI Preview — only runs when the user clicks the button.
 * Expands the ChatGPT simulation box below the form fields.
 */
export default function CampaignAiPreview({
  businessName,
  city,
  category,
  feature1,
  feature2,
  feature3,
}: {
  businessName: string;
  city: string;
  category: string;
  feature1?: string;
  feature2?: string;
  feature3?: string;
}) {
  const [phase, setPhase] = useState<PreviewPhase>("idle");
  const [showPreview, setShowPreview] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [preview, setPreview] = useState<AiPreviewPayload | null>(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const canPreview =
    businessName.trim().length >= 2 &&
    city.trim().length >= 2 &&
    category.trim().length >= 2;

  useEffect(() => {
    if (phase !== "scanning") return;
    setScanLine(0);
    const timers = [
      window.setTimeout(() => setScanLine(1), 800),
      window.setTimeout(() => setScanLine(2), 1600),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [phase]);

  // Reset expanded preview if core inputs change after a run.
  useEffect(() => {
    setShowPreview(false);
    setPreview(null);
    setPhase("idle");
    setError("");
  }, [businessName, city, category]);

  async function runPreview() {
    if (!canPreview || isScanning) return;
    setError("");
    setShowPreview(true);
    setIsScanning(true);
    setPhase("scanning");
    setPreview(null);

    const started = Date.now();

    try {
      const res = await fetch("/api/preview-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city: city.trim(),
          category: category.trim(),
          feature1: feature1?.trim() || undefined,
          feature2: feature2?.trim() || undefined,
          feature3: feature3?.trim() || undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        preview?: AiPreviewPayload;
      };

      if (!res.ok || !data.preview) {
        throw new Error(data.error || "Could not generate preview.");
      }

      const elapsed = Date.now() - started;
      if (elapsed < 2400) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, 2400 - elapsed),
        );
      }

      setPreview(data.preview);
      setPhase("ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate preview.",
      );
      setPhase("idle");
      setShowPreview(false);
    } finally {
      setIsScanning(false);
    }
  }

  if (!canPreview && !showPreview) {
    return null;
  }

  return (
    <div className="space-y-4">
      {canPreview ? (
        <button
          type="button"
          onClick={() => void runPreview()}
          disabled={isScanning}
          className="lf-btn-primary inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-white disabled:opacity-60 sm:w-auto"
        >
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span aria-hidden>✨</span>
          )}
          <span>
            {isScanning ? "Scanning live…" : "See AI Preview"}
          </span>
          {!isScanning ? <span aria-hidden>→</span> : null}
        </button>
      ) : null}

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {showPreview ? (
        <div className="space-y-4 overflow-hidden">
          {phase === "scanning" ? (
            <div className="flex min-h-[220px] flex-col justify-center rounded-2xl border border-emerald-500/20 bg-[#0B0F17] p-5 font-mono text-sm text-emerald-200/95 shadow-[inset_0_0_40px_rgba(16,185,129,0.08)]">
              <p className="mb-4 text-xs uppercase tracking-[0.18em] text-emerald-400/80">
                Live scan terminal
              </p>
              {SCAN_LINES.map((line, index) => (
                <p
                  key={line}
                  className={`mb-2 transition ${
                    index <= scanLine ? "opacity-100" : "opacity-25"
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

          {phase === "ready" && preview ? (
            <>
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
                    <p className="text-[11px] text-[#94a3b8]">Model: GPT-4o</p>
                  </div>
                </div>

                <div className="space-y-4 px-4 py-4">
                  <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2.5 text-sm text-[#e9d5ff]">
                    {preview.question}
                  </div>
                  <TypewriterMarkdown text={preview.answerMarkdown} active />
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
