"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import DarkSelect from "@/components/ui/DarkSelect";
import { UK_CITIES } from "@/lib/constants/cities";
import { listBusinessCategoryOptions } from "@/lib/constants/categories";
import {
  saveLeadMagnetInput,
  type LeadMagnetInput,
} from "@/lib/lead-magnet";
import UnlockPreviewModal from "@/components/landing/UnlockPreviewModal";

const SCAN_LINES = [
  "Scanning Google Business Registry...",
  "Matching category & city signals...",
  "Preparing your AI search report...",
] as const;

const CATEGORY_OPTIONS = listBusinessCategoryOptions();

/**
 * Landing hero lead magnet: Business Name + Category + City only.
 * Scan → forced unlock/auth modal → dashboard preview.
 */
export default function LeadMagnetHero() {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [lead, setLead] = useState<LeadMagnetInput | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload: LeadMagnetInput = {
      businessName: businessName.trim(),
      category: category.trim(),
      city: city.trim(),
    };

    if (payload.businessName.length < 2) {
      setError("Please enter your business name.");
      return;
    }
    if (!payload.category) {
      setError("Please select a category.");
      return;
    }
    if (!payload.city) {
      setError("Please select a town or city.");
      return;
    }

    saveLeadMagnetInput(payload);
    setLead(payload);
    setScanning(true);
    setScanLine(0);

    window.setTimeout(() => setScanLine(1), 500);
    window.setTimeout(() => setScanLine(2), 1000);

    await new Promise((resolve) => window.setTimeout(resolve, 1500));

    setScanning(false);
    setUnlockOpen(true);
  }

  return (
    <>
      <div
        id="lead-magnet"
        className="lf-animate-in lf-animate-in-3 w-full max-w-lg rounded-[22px] border border-violet-500/30 bg-[linear-gradient(165deg,rgba(18,12,30,0.96),rgba(11,15,23,0.98))] p-5 shadow-[0_0_48px_rgba(139,92,246,0.14)] sm:p-6"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
          Free AI search report
        </p>
        <h2 className="lf-orbitron mt-2 text-xl font-bold text-white sm:text-2xl">
          See how ChatGPT would rank your business
        </h2>
        <p className="mt-2 text-sm text-[#94a3b8]">
          Enter 3 details — we scan Google and unlock your live AI preview.
        </p>

        {scanning ? (
          <div className="mt-5 min-h-[220px] rounded-2xl border border-emerald-500/20 bg-[#0B0F17] p-4 font-mono text-sm text-emerald-200/95">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-emerald-400/80">
              Live scan
            </p>
            {SCAN_LINES.map((line, index) => (
              <p
                key={line}
                className={`mb-2 transition ${
                  index <= scanLine ? "opacity-100" : "opacity-30"
                }`}
              >
                {index < scanLine ? "✓ " : index === scanLine ? "› " : "  "}
                {line}
              </p>
            ))}
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-3/4 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-violet-400" />
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleGenerate(e)} className="mt-5 space-y-3.5">
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
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#94a3b8]">
                Category
              </label>
              <DarkSelect
                value={category}
                onChange={setCategory}
                placeholder="e.g. Health & Dental Clinic"
                options={CATEGORY_OPTIONS.map((c) => ({
                  value: c.name,
                  label: c.name,
                }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#94a3b8]">
                City
              </label>
              <DarkSelect
                value={city}
                onChange={setCity}
                placeholder="e.g. Bristol"
                options={UK_CITIES.map((c) => ({ value: c, label: c }))}
              />
            </div>

            {error ? (
              <p className="text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="lf-btn-primary inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white"
            >
              <span aria-hidden>🚀</span>
              <span>Generate My AI Search Report</span>
              <span aria-hidden>→</span>
            </button>
            <p className="text-center text-[11px] text-[#64748b]">
              No credit card required • Takes under 30 seconds
            </p>
          </form>
        )}
      </div>

      <UnlockPreviewModal
        open={unlockOpen}
        onClose={() => setUnlockOpen(false)}
        lead={lead}
      />
    </>
  );
}
