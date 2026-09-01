"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, RotateCcw, Search, Sparkles, Zap } from "lucide-react";
import DarkSelect from "@/components/ui/DarkSelect";
import LandingPhoneMockup from "@/components/landing/LandingPhoneMockup";
import AuditTerminalLoader from "@/components/landing/ai-audit/AuditTerminalLoader";
import {
  AuditChatPanelAfter,
  AuditChatPanelBefore,
} from "@/components/landing/ai-audit/AuditChatPanels";
import AuditSimulatorCta from "@/components/landing/ai-audit/AuditSimulatorCta";
import {
  AUDIT_SCAN_DURATION_MS,
  isAuditCategory,
  type AuditCompetitor,
} from "@/lib/constants/audit-sectors";
import {
  CUSTOM_CATEGORY_OPTION_VALUE,
  isValidCategoryName,
  listBusinessCategoryOptions,
  normalizeCategoryName,
} from "@/lib/constants/categories";
import type { BillingCycle } from "@/lib/constants/pricing-plans";

const CATEGORY_OPTIONS = listBusinessCategoryOptions();

type AutocompleteSuggestion = {
  placeId: string;
  label: string;
  mainText: string;
  secondaryText: string;
};

type SimulatorResult = {
  businessName: string;
  formattedAddress: string;
  phoneNumber: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  city: string;
  placeId: string | null;
  category: string;
  boneQuestion: string;
  competitors: readonly AuditCompetitor[];
};

const MANUAL_AUDIT_PLACE_ID = "__manual__";

type Phase = "input" | "scanning" | "results";

export default function LandingAiAuditSection({
  onFixVisibility,
}: {
  onFixVisibility: (payload: {
    businessName: string;
    city: string;
    category: string;
    billingCycle: BillingCycle;
    formattedAddress: string;
    phoneNumber: string | null;
  }) => void;
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("input");
  const [category, setCategory] = useState("");
  const [customCategoryOpen, setCustomCategoryOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [manualMode, setManualMode] = useState(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selected, setSelected] = useState<AutocompleteSuggestion | null>(null);

  const [manualBusinessName, setManualBusinessName] = useState("");
  const [manualWebsite, setManualWebsite] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [error, setError] = useState("");

  const trimmedQuery = query.trim();
  const showSuggestions =
    phase === "input" && suggestionsOpen && trimmedQuery.length >= 2;

  function resolvedCategory(): string {
    if (customCategoryOpen || category === CUSTOM_CATEGORY_OPTION_VALUE) {
      return normalizeCategoryName(customCategory);
    }
    return normalizeCategoryName(category);
  }

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
    if (phase !== "input" || manualMode) return;

    if (selected && trimmedQuery === selected.label) return;
    if (selected && trimmedQuery !== selected.label) {
      setSelected(null);
      setResult(null);
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

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
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestionsLoading(false));
    }, 280);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, selected, trimmedQuery, phase, manualMode]);

  function selectSuggestion(item: AutocompleteSuggestion) {
    setSelected(item);
    setQuery(item.label);
    setManualBusinessName(item.mainText);
    setSuggestionsOpen(false);
    setResult(null);
    setError("");
  }

  function selectManualSearch(name: string) {
    selectSuggestion({
      placeId: MANUAL_AUDIT_PLACE_ID,
      label: name,
      mainText: name,
      secondaryText: "Manual UAE search (not on Google Maps)",
    });
    setManualMode(true);
  }

  function buildScanPayload() {
    const usePlaceId =
      !manualMode &&
      selected?.placeId &&
      selected.placeId !== MANUAL_AUDIT_PLACE_ID &&
      trimmedQuery === selected.label;

    const businessName = manualMode
      ? manualBusinessName.trim()
      : trimmedQuery;

    return {
      category: resolvedCategory(),
      ...(usePlaceId ? { placeId: selected!.placeId } : { businessName }),
      manualWebsite: manualWebsite.trim() || undefined,
      manualPhone: manualPhone.trim() || undefined,
    };
  }

  function validateInput(): string | null {
    if (customCategoryOpen || category === CUSTOM_CATEGORY_OPTION_VALUE) {
      if (!isValidCategoryName(customCategory)) {
        return "Please enter your category (2–80 characters).";
      }
    } else if (!category) {
      return "Please choose a category.";
    } else if (!isAuditCategory(category)) {
      return "Please select a valid category.";
    }
    if (manualMode) {
      if (manualBusinessName.trim().length < 2) {
        return "Enter your business name (at least 2 characters).";
      }
      return null;
    }
    if (trimmedQuery.length < 2) {
      return "Search and select your business on Google Maps UAE.";
    }
    return null;
  }

  async function handleSimulate() {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPhase("scanning");
    setError("");
    setResult(null);

    try {
      const [response] = await Promise.all([
        fetch("/api/places/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildScanPayload()),
        }),
        new Promise((resolve) =>
          window.setTimeout(resolve, AUDIT_SCAN_DURATION_MS),
        ),
      ]);

      const data = (await response.json()) as {
        error?: string;
        result?: SimulatorResult;
      };

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Simulation failed. Please try again.");
      }

      setResult(data.result);
      setPhase("results");
    } catch (err) {
      setPhase("input");
      setError(
        err instanceof Error ? err.message : "Simulation failed. Please try again.",
      );
    }
  }

  function resetSimulator() {
    setPhase("input");
    setResult(null);
    setError("");
  }

  function handleCheckout() {
    if (!result) return;
    onFixVisibility({
      businessName: result.businessName,
      city: result.city,
      category: result.category,
      billingCycle,
      formattedAddress: result.formattedAddress,
      phoneNumber: result.phoneNumber,
    });
  }

  const cardWidthClass =
    phase === "results" ? "max-w-6xl" : "max-w-xl";

  return (
    <section className="scroll-mt-24 overflow-visible pb-6 pt-2">
      <LandingPhoneMockup className="lf-ai-audit-phone-wrap mb-10" />

      <div
        id="ai-audit-section"
        className={`lf-ai-audit-card-wrap lf-animate-in mx-auto overflow-visible transition-all duration-500 ${cardWidthClass}`}
      >
        <article
          ref={rootRef}
          className="lf-neon-card lf-neon-card--overflow-visible"
        >
          <div className="lf-neon-inner overflow-visible p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300">
              Live AI Visibility Simulator
            </p>
            <h2 className="lf-orbitron mt-3 text-xl font-bold text-white sm:text-2xl">
              Audit Your UAE Business on AI Search Engines
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
              Pick your category, pull your Google Maps listing across Dubai, Abu
              Dhabi &amp; the UAE — then simulate how ChatGPT answers today vs.
              after FerixAI.
            </p>

            {phase === "input" ? (
              <div className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="audit-category"
                    className="mb-1.5 block text-sm font-medium text-[#94a3b8]"
                  >
                    Category
                  </label>
                  {!customCategoryOpen ? (
                    <>
                      <DarkSelect
                        id="audit-category"
                        value={category}
                        onChange={(value) => {
                          setCategory(value);
                          setCustomCategoryOpen(false);
                          setCustomCategory("");
                          setError("");
                        }}
                        placeholder="Select a category"
                        options={CATEGORY_OPTIONS.map((item) => ({
                          value: item.name,
                          label: item.name,
                        }))}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCategoryOpen(true);
                          setCategory(CUSTOM_CATEGORY_OPTION_VALUE);
                          setCustomCategory("");
                          setError("");
                        }}
                        className="mt-2 text-left text-sm font-semibold text-teal-300 transition hover:text-teal-200 hover:underline"
                      >
                        If your category isn&apos;t listed, click here
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        id="audit-category"
                        type="text"
                        value={customCategory}
                        onChange={(event) => {
                          setCustomCategory(event.target.value);
                          setError("");
                        }}
                        placeholder="Type your category"
                        maxLength={80}
                        className="lf-input w-full"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCategoryOpen(false);
                          setCustomCategory("");
                          setCategory("");
                          setError("");
                        }}
                        className="text-sm font-semibold text-[#94a3b8] transition hover:text-white hover:underline"
                      >
                        Back to category list
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#94a3b8]">
                    {manualMode
                      ? "Manual business details"
                      : "Google Maps UAE search"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setManualMode((current) => !current);
                      setError("");
                    }}
                    className="text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
                  >
                    {manualMode
                      ? "Search on Google Maps instead"
                      : "Can't find on Maps?"}
                  </button>
                </div>

                {manualMode ? (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <input
                      type="text"
                      value={manualBusinessName}
                      onChange={(event) => {
                        setManualBusinessName(event.target.value);
                        setError("");
                      }}
                      placeholder="Business name"
                      className="lf-input w-full"
                    />
                    <input
                      type="url"
                      value={manualWebsite}
                      onChange={(event) => setManualWebsite(event.target.value)}
                      placeholder="Website URL (optional)"
                      className="lf-input w-full"
                    />
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(event) => setManualPhone(event.target.value)}
                      placeholder="Phone number (optional)"
                      className="lf-input w-full"
                    />
                  </div>
                ) : (
                  <div className="relative z-[100]">
                    <label className="sr-only" htmlFor="ai-audit-search">
                      Search your UAE business
                    </label>
                    <div className="relative z-[100]">
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
                            void handleSimulate();
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
                                    Search for &quot;{trimmedQuery}&quot; manually
                                  </span>
                                  <span className="mt-0.5 text-xs text-[#94a3b8]">
                                    Not on Google Maps? Enter details yourself
                                  </span>
                                </button>
                              </li>
                            </>
                          )}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => void handleSimulate()}
                  className="group relative inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_32px_rgba(192,38,211,0.35)] transition hover:scale-[1.01] hover:shadow-[0_0_42px_rgba(52,211,153,0.45)] sm:text-base"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition group-hover:opacity-100" />
                  <Zap className="h-4 w-4" />
                  Simulate AI Visibility
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {phase === "scanning" ? <AuditTerminalLoader /> : null}

            {error ? (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            {phase === "results" && result ? (
              <div className="lf-animate-in mt-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      Simulation complete
                    </p>
                    <p className="mt-1 text-sm text-[#94a3b8]">
                      {result.category} · {result.businessName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetSimulator}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#94a3b8] transition hover:border-emerald-500/40 hover:text-emerald-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Run another simulation
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <AuditChatPanelBefore
                    boneQuestion={result.boneQuestion}
                    competitors={result.competitors}
                    businessName={result.businessName}
                  />
                  <AuditChatPanelAfter
                    boneQuestion={result.boneQuestion}
                    businessName={result.businessName}
                    formattedAddress={result.formattedAddress}
                    websiteUri={result.websiteUri}
                    phoneNumber={result.phoneNumber}
                    rating={result.rating}
                  />
                </div>

                <AuditSimulatorCta
                  billingCycle={billingCycle}
                  onBillingCycleChange={setBillingCycle}
                  onCheckout={handleCheckout}
                />
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
