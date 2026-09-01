"use client";

import { Bot } from "lucide-react";
import type { AuditCompetitor } from "@/lib/constants/audit-sectors";

function Stars({ rating }: { rating: number | null }) {
  const value = rating ?? 0;
  const full = Math.round(value);
  return (
    <span className="text-amber-300">
      {"⭐".repeat(Math.max(1, Math.min(5, full)))}
    </span>
  );
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
      <header className="border-b border-red-500/20 bg-red-500/10 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-200/90">
          ❌ Current Status — Customer Loss
        </p>
      </header>
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10a37f]/20 ring-1 ring-[#10a37f]/40">
          <Bot className="h-5 w-5 text-[#10a37f]" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-white">ChatGPT</p>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs italic leading-relaxed text-[#cbd5e1]">
          &quot;{boneQuestion}&quot;
        </div>
        <ol className="space-y-2.5 text-sm text-[#e2e8f0]">
          {competitors.map((competitor, index) => (
            <li
              key={competitor.name}
              className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5"
            >
              <span className="font-semibold text-white">
                {index + 1}. {competitor.name}
              </span>
              <span className="mt-1 block text-xs italic text-[#94a3b8]">
                — {competitor.subtitle}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <footer className="mt-auto border-t border-red-500/25 bg-red-500/10 p-4 text-xs leading-relaxed text-red-100">
        🔴 Warning:{" "}
        <strong className="font-semibold text-white">{businessName}</strong> is
        NOT indexed in OpenAI &amp; Claude Entity Graphs.{" "}
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
      <header className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/90">
          ✨ After FerixAI Optimization
        </p>
      </header>
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10a37f]/20 ring-1 ring-[#10a37f]/40">
          <Bot className="h-5 w-5 text-[#10a37f]" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-white">ChatGPT</p>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs italic leading-relaxed text-[#cbd5e1]">
          &quot;{boneQuestion}&quot;
        </div>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3.5 text-sm leading-relaxed text-[#e2e8f0]">
          <p className="font-bold text-white">
            1. {businessName} <Stars rating={rating} />{" "}
            <span className="text-xs font-normal text-emerald-200">
              (Rating: {ratingLabel})
            </span>
          </p>
          <p className="mt-2 text-xs text-[#cbd5e1]">
            📍 Address: {formattedAddress}
          </p>
          <p className="mt-1 text-xs text-[#cbd5e1]">
            🌐 Website: {websiteUri || "Not listed"}
          </p>
          <p className="mt-1 text-xs text-[#cbd5e1]">
            📞 Phone: {phoneNumber || "Not listed"}
          </p>
          <p className="mt-3 text-xs italic text-emerald-100/90">
            💬 &quot;Officially verified via Enterprise AEO Index. Recognized as
            one of the premier licensed providers in Dubai.&quot;
          </p>
        </div>
      </div>
      <footer className="mt-auto border-t border-emerald-500/25 bg-emerald-500/10 p-4 text-xs leading-relaxed text-emerald-100">
        🟢 100% Entity Authority Active across ChatGPT, Claude &amp; Gemini.
      </footer>
    </article>
  );
}
