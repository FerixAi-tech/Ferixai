"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { formatLandingCurrency } from "@/lib/constants/landing-locale";
import { listPricingPlans } from "@/lib/constants/pricing-plans";
import LandingPhoneMockup from "@/components/landing/LandingPhoneMockup";

type AutocompleteSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

type AuditResult = {
  businessName: string;
  formattedAddress: string;
  phoneNumber: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  city: string;
  placeId: string | null;
  visibilityScore: number;
  visibilityBand: string;
  statusItems: ReadonlyArray<{ icon: string; text: string }>;
};

const STARTER_MONTHLY = listPricingPlans()[0]!.priceMonthlyGbp;

export default function LandingAiAuditSection({
  onFixVisibility,
}: {
  onFixVisibility: (payload: {
    businessName: string;
    city: string;
    formattedAddress: string;
    phoneNumber: string | null;
  }) => void;
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selected, setSelected] = useState<AutocompleteSuggestion | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (selected && query.trim() === selected.label) {
      return;
    }
    if (selected && query.trim() !== selected.label) {
      setSelected(null);
      setResult(null);
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    debounceRef.current = window.setTimeout(() => {
      void fetch(`/api/places/autocomplete?q=${encodeURIComponent(trimmed)}`)
        .then(async (response) => {
          const data = (await response.json()) as {
            suggestions?: AutocompleteSuggestion[];
          };
          setSuggestions(data.suggestions ?? []);
          setSuggestionsOpen(true);
        })
        .catch(() => {
          setSuggestions([]);
        })
        .finally(() => {
          setSuggestionsLoading(false);
        });
    }, 280);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query, selected]);

  function selectSuggestion(item: AutocompleteSuggestion) {
    setSelected(item);
    setQuery(item.label);
    setSuggestionsOpen(false);
    setResult(null);
    setError("");
  }

  async function handleScan() {
    if (!selected?.placeId) {
      setError("Search and select your business from the Netherlands suggestions.");
      return;
    }

    setScanning(true);
    setError("");
    setResult(null);
    setScanMessage("Querying ChatGPT, Gemini & Claude knowledge graphs...");

    await new Promise((resolve) => window.setTimeout(resolve, 2400));

    try {
      const response = await fetch("/api/places/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: selected.placeId }),
      });
      const data = (await response.json()) as {
        error?: string;
        result?: AuditResult;
      };

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Scan failed. Please try again.");
      }

      setResult(data.result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Scan failed. Please try again.",
      );
    } finally {
      setScanning(false);
      setScanMessage("");
    }
  }

  return (
    <section id="ai-audit-section" className="scroll-mt-24 pb-10 pt-2">
      <div className="lf-animate-in mx-auto max-w-xl">
        <article
          ref={rootRef}
          className="lf-neon-card overflow-visible"
        >
          <div className="lf-neon-spin" aria-hidden />
          <div className="lf-neon-inner p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
              AI visibility audit
            </p>
            <h2 className="lf-orbitron mt-3 text-xl font-bold text-white sm:text-2xl">
              Audit Your Business on AI Search Engines
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
              Search your business across Google Maps data to simulate your
              real-time ChatGPT &amp; Gemini visibility score.
            </p>

            <div className="relative mt-6">
              <label className="sr-only" htmlFor="ai-audit-search">
                Search your business in the Netherlands
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
                  <input
                    id="ai-audit-search"
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSuggestionsOpen(true);
                      setError("");
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setSuggestionsOpen(true);
                    }}
                    placeholder="Search your business in the Netherlands"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={suggestionsOpen}
                    aria-controls={listboxId}
                    className="lf-input w-full pl-10"
                  />
                  {suggestionsOpen &&
                  (suggestions.length > 0 || suggestionsLoading) ? (
                    <ul
                      id={listboxId}
                      role="listbox"
                      className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-[#0e0a18] py-1 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                    >
                      {suggestionsLoading ? (
                        <li className="flex items-center gap-2 px-4 py-3 text-sm text-[#94a3b8]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching Google Places…
                        </li>
                      ) : (
                        suggestions.map((item) => (
                          <li key={item.placeId} role="option">
                            <button
                              type="button"
                              onClick={() => selectSuggestion(item)}
                              className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-white/5"
                            >
                              <span className="text-sm font-semibold text-white">
                                {item.mainText}
                              </span>
                              {item.secondaryText ? (
                                <span className="mt-0.5 text-xs text-[#94a3b8]">
                                  {item.secondaryText}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => void handleScan()}
                  disabled={scanning}
                  className="lf-btn-primary inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {scanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Scan Now ⚡
                </button>
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            {scanning ? (
              <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-5">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
                  <p className="text-sm font-medium text-emerald-100">
                    {scanMessage}
                  </p>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-950/60">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-fuchsia-400" />
                </div>
              </div>
            ) : null}

            {result ? (
              <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                      Business
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {result.businessName}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                      Phone
                    </dt>
                    <dd className="mt-1 text-sm text-white">
                      {result.phoneNumber || "Not listed"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:col-span-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-white">
                      {result.formattedAddress}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                      Google Rating
                    </dt>
                    <dd className="mt-1 text-sm text-white">
                      {result.rating != null ? `${result.rating.toFixed(1)} ★` : "N/A"}
                      {result.userRatingsTotal != null
                        ? ` · ${result.userRatingsTotal} reviews`
                        : ""}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-200/80">
                      AI Visibility Score
                    </dt>
                    <dd className="lf-orbitron mt-1 text-2xl font-bold text-red-200">
                      {result.visibilityScore}%{" "}
                      <span className="text-sm font-semibold text-red-100/90">
                        [{result.visibilityBand}]
                      </span>
                    </dd>
                  </div>
                </dl>

                <ul className="space-y-2.5">
                  {result.statusItems.map((item) => (
                    <li
                      key={item.text}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#e2e8f0]"
                    >
                      {item.icon} <span className="text-[#cbd5e1]">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() =>
                    onFixVisibility({
                      businessName: result.businessName,
                      city: result.city,
                      formattedAddress: result.formattedAddress,
                      phoneNumber: result.phoneNumber,
                    })
                  }
                  className="lf-btn-primary inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white sm:text-base"
                >
                  Fix Visibility &amp; Claim #1 Spot (
                  {formatLandingCurrency(STARTER_MONTHLY)}/mo)
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </article>
      </div>

      <LandingPhoneMockup className="mt-10" />
    </section>
  );
}
