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
const MANUAL_AUDIT_PLACE_ID = "__manual__";

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

  const trimmedQuery = query.trim();
  const showSuggestions =
    suggestionsOpen && trimmedQuery.length >= 2;

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
    if (selected && trimmedQuery === selected.label) {
      return;
    }
    if (selected && trimmedQuery !== selected.label) {
      setSelected(null);
      setResult(null);
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    debounceRef.current = window.setTimeout(() => {
      void fetch(`/api/places/autocomplete?q=${encodeURIComponent(trimmedQuery)}`)
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
  }, [query, selected, trimmedQuery]);

  function selectSuggestion(item: AutocompleteSuggestion) {
    setSelected(item);
    setQuery(item.label);
    setSuggestionsOpen(false);
    setResult(null);
    setError("");
  }

  function selectManualSearch(name: string) {
    selectSuggestion({
      placeId: MANUAL_AUDIT_PLACE_ID,
      label: name,
      mainText: name,
      secondaryText: "Search in the UAE (not listed on Google Maps)",
    });
  }

  function buildScanPayload() {
    const usePlaceId =
      selected?.placeId &&
      selected.placeId !== MANUAL_AUDIT_PLACE_ID &&
      trimmedQuery === selected.label;

    if (usePlaceId) {
      return { placeId: selected.placeId };
    }

    return { businessName: trimmedQuery };
  }

  async function handleScan() {
    if (trimmedQuery.length < 2) {
      setError("Enter your UAE business name (at least 2 characters).");
      return;
    }

    setScanning(true);
    setError("");
    setResult(null);
    setScanMessage(
      "Scanning UAE Google Maps data and querying ChatGPT, Gemini & Claude…",
    );

    await new Promise((resolve) => window.setTimeout(resolve, 2400));

    try {
      const response = await fetch("/api/places/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildScanPayload()),
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
    <section className="scroll-mt-24 overflow-visible pb-6 pt-2">
      <LandingPhoneMockup className="lf-ai-audit-phone-wrap mb-10" />

      <div
        id="ai-audit-section"
        className="lf-ai-audit-card-wrap lf-animate-in mx-auto max-w-xl overflow-visible"
      >
        <article
          ref={rootRef}
          className="lf-neon-card lf-neon-card--overflow-visible"
        >
          <div className="lf-neon-inner overflow-visible p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
              UAE AI visibility audit
            </p>
            <h2 className="lf-orbitron mt-3 text-xl font-bold text-white sm:text-2xl">
              Audit Your UAE Business on AI Search Engines
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
              Search your business on Google Maps across Dubai, Abu Dhabi &amp;
              the UAE — then simulate your real-time ChatGPT &amp; Gemini
              visibility score.
            </p>

            <div className="relative z-[100] mt-6">
              <label className="sr-only" htmlFor="ai-audit-search">
                Search your UAE business
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative z-[100] min-w-0 flex-1">
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
                      if (trimmedQuery.length >= 2) setSuggestionsOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleScan();
                      }
                    }}
                    placeholder="e.g. Your café in Dubai Marina"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showSuggestions}
                    aria-controls={listboxId}
                    className="lf-input w-full pl-10"
                  />
                  {showSuggestions ? (
                    <ul
                      id={listboxId}
                      role="listbox"
                      className="absolute left-0 top-full z-[9999] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-emerald-500/30 bg-black/90 py-1 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-md"
                    >
                      {suggestionsLoading ? (
                        <li className="flex items-center gap-2 px-4 py-3 text-sm text-[#94a3b8]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching Google Maps UAE…
                        </li>
                      ) : (
                        <>
                          {suggestions.map((item) => (
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
                          ))}
                          <li role="option">
                            <button
                              type="button"
                              onClick={() => selectManualSearch(trimmedQuery)}
                              className="flex w-full flex-col border-t border-white/10 px-4 py-3 text-left transition hover:bg-emerald-500/10"
                            >
                              <span className="text-sm font-semibold text-emerald-200">
                                Search for &quot;{trimmedQuery}&quot; in the UAE
                              </span>
                              <span className="mt-0.5 text-xs text-[#94a3b8]">
                                Not listed on Google Maps? Scan anyway
                              </span>
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => void handleScan()}
                  disabled={scanning || trimmedQuery.length < 2}
                  className="lf-btn-primary inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {scanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Scan Now ⚡
                </button>
              </div>
              <p className="mt-2 text-xs text-[#64748b]">
                Can&apos;t find your listing? Type your business name and tap{" "}
                <span className="font-semibold text-[#94a3b8]">Scan Now</span> —
                we&apos;ll still run the audit.
              </p>
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
    </section>
  );
}
