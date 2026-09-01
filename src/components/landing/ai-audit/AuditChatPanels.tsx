"use client";

import { Bot } from "lucide-react";
import type { AuditCompetitor } from "@/lib/constants/audit-sectors";

function Stars({ rating }: { rating: number | null }) {
  const value = rating ?? 0;
  const full = Math.round(value);
  return (
    <span className="text-lg text-amber-300 sm:text-xl">
      {"⭐".repeat(Math.max(1, Math.min(5, full)))}
    </span>
  );
}

function websiteHref(uri: string): string {
  const trimmed = uri.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function AuditChatPanelBefore({
  boneQuestion,
  competitors,
  businessName,
}: {
  boneQuestion: string;
  competitors: readonly AuditCompetitor[];
  businessName: string;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-red-500/35 bg-[#0a0d14] shadow-[0_0_40px_rgba(239,68,68,0.08)]">
      <header className="border-b border-red-500/20 bg-red-500/10 px-4 py-3.5 sm:px-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-200/90 sm:text-sm">
          ❌ Current Status — Customer Loss
        </p>
      </header>
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 sm:px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10a37f]/20 ring-1 ring-[#10a37f]/40">
          <Bot className="h-5 w-5 text-[#10a37f]" aria-hidden />
        </div>
        <p className="text-base font-semibold text-white sm:text-lg">ChatGPT</p>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm italic leading-relaxed text-[#cbd5e1] sm:text-base">
          &quot;{boneQuestion}&quot;
        </div>
        <ol className="space-y-3 text-base text-[#e2e8f0] sm:text-lg">
          {competitors.map((competitor, index) => (
            <li
              key={competitor.name}
              className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3"
            >
              <span className="font-semibold text-white">
                {index + 1}. {competitor.name}
              </span>
              <span className="mt-1 block text-sm italic text-[#94a3b8] sm:text-base">
                — {competitor.subtitle}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <footer className="mt-auto border-t border-red-500/25 bg-red-500/10 p-4 text-sm leading-relaxed text-red-100 sm:p-5 sm:text-base">
        🔴 Warning:{" "}
        <strong className="font-semibold text-white">{businessName}</strong>{" "}
        is NOT indexed in OpenAI &amp; Claude Entity Graphs.{" "}
        <strong className="text-red-200">0 Leads Captured.</strong>
      </footer>
    </article>
  );
}

export function AuditChatPanelAfter({
  boneQuestion,
  businessName,
  formattedAddress,
  websiteUri,
  phoneNumber,
  rating,
}: {
  boneQuestion: string;
  businessName: string;
  formattedAddress: string;
  websiteUri: string | null;
  phoneNumber: string | null;
  rating: number | null;
}) {
  const ratingLabel =
    rating != null ? `${rating.toFixed(1)}/5.0` : "Verified listing";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-500/35 bg-[#0a0d14] shadow-[0_0_40px_rgba(16,185,129,0.12)]">
      <header className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 sm:px-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/90 sm:text-sm">
          ✨ After FerixAI Optimization
        </p>
      </header>
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 sm:px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10a37f]/20 ring-1 ring-[#10a37f]/40">
          <Bot className="h-5 w-5 text-[#10a37f]" aria-hidden />
        </div>
        <p className="text-base font-semibold text-white sm:text-lg">ChatGPT</p>
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm italic leading-relaxed text-[#cbd5e1] sm:text-base">
          &quot;{boneQuestion}&quot;
        </div>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-4 text-base leading-relaxed text-[#e2e8f0] sm:px-5 sm:py-5 sm:text-lg">
          <p className="text-lg font-bold text-white sm:text-xl">
            1. {businessName}{" "}
            <Stars rating={rating} />{" "}
            <span className="mt-1 block text-sm font-normal text-emerald-200 sm:inline sm:text-base">
              (Rating: {ratingLabel})
            </span>
          </p>
          <p className="mt-3 text-sm text-[#cbd5e1] sm:text-base">
            📍 Address: {formattedAddress}
          </p>
          <p className="mt-2 text-sm text-[#cbd5e1] sm:text-base">
            🌐 Website:{" "}
            {websiteUri ? (
              <a
                href={websiteHref(websiteUri)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-emerald-300 underline decoration-emerald-400/50 underline-offset-2 transition hover:text-emerald-200 hover:decoration-emerald-300"
              >
                {websiteUri}
              </a>
            ) : (
              "Not listed"
            )}
          </p>
          <p className="mt-2 text-sm text-[#cbd5e1] sm:text-base">
            📞 Phone: {phoneNumber || "Not listed"}
          </p>
          <p className="mt-4 text-sm italic text-emerald-100/90 sm:text-base">
            💬 &quot;Officially verified via Enterprise AEO Index. Recognized as
            one of the premier licensed providers in Dubai.&quot;
          </p>
        </div>
      </div>
      <footer className="mt-auto border-t border-emerald-500/25 bg-emerald-500/10 p-4 text-sm leading-relaxed text-emerald-100 sm:p-5 sm:text-base">
        🟢 100% Entity Authority Active across ChatGPT, Claude &amp; Gemini.
      </footer>
    </article>
  );
}
